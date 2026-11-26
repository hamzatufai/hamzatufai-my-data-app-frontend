import type { DatasetProfile } from "../lib/profiles";

type WorkerReply =
  | { ok: true; profile: Omit<DatasetProfile, "id" | "importedAt"> }
  | { ok: false; error: string };

const COLORS: Record<string, string> = {
  Text: "#2ee6a6",
  Numeric: "#3b82f6",
  Date: "#a78bfa",
  Boolean: "#f59e0b",
  Other: "#64748b",
};

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<File>) => void) | null;
  postMessage: (message: WorkerReply) => void;
};

function parseCsv(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      record.push(field);
      field = "";
      if (record.some((value) => value.trim() !== "")) records.push(record);
      record = [];
      if (char === "\r" && text[i + 1] === "\n") i += 1;
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("The CSV has an unclosed quoted field.");
  record.push(field);
  if (record.some((value) => value.trim() !== "")) records.push(record);
  return records;
}

function detectType(value: string): string {
  const normalized = value.trim();
  if (/^(true|false|yes|no)$/i.test(normalized)) return "Boolean";
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return "Numeric";
  if (/[/-]/.test(normalized) && !Number.isNaN(Date.parse(normalized))) return "Date";
  return "Text";
}

async function profileFile(file: File): Promise<Omit<DatasetProfile, "id" | "importedAt">> {
  const text = (await file.text()).replace(/^\uFEFF/, "");
  const records = parseCsv(text);
  if (records.length < 2) throw new Error("Add a header row and at least one data row.");

  if (records[0].length > 200) {
    throw new Error("This profiler supports up to 200 columns per CSV.");
  }
  const headers = records[0].map((name, index) => name.trim() || `Column ${index + 1}`);
  if (headers.length === 0) throw new Error("The CSV does not contain any columns.");

  const rows = records.slice(1).map((row) =>
    Array.from({ length: headers.length }, (_, index) => (row[index] ?? "").trim()),
  );
  if (rows.length > 250_000) {
    throw new Error("This file has more than 250,000 rows. Split it into smaller CSV files and retry.");
  }

  const typeCounts = headers.map(() => new Map<string, number>());
  const missingByColumn = headers.map(() => 0);
  const uniqueRows = new Set<string>();
  let missingCells = 0;
  let duplicateRows = 0;

  for (const row of rows) {
    const signature = JSON.stringify(row);
    if (uniqueRows.has(signature)) duplicateRows += 1;
    else uniqueRows.add(signature);

    row.forEach((value, index) => {
      if (value === "") {
        missingCells += 1;
        missingByColumn[index] += 1;
      } else {
        const type = detectType(value);
        typeCounts[index].set(type, (typeCounts[index].get(type) ?? 0) + 1);
      }
    });
  }

  const columns = headers.map((name, index) => {
    const nullPct = rows.length ? (missingByColumn[index] / rows.length) * 100 : 0;
    const type = [...typeCounts[index].entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other";
    return {
      name,
      type,
      nullPct: Math.round(nullPct * 10) / 10,
      quality: Math.round(100 - nullPct),
    };
  });

  const totalCells = rows.length * headers.length;
  const issueRate = totalCells
    ? Math.min(1, (missingCells + duplicateRows * headers.length) / totalCells)
    : 0;
  const quality = Math.round((1 - issueRate) * 100);
  const typeTotals = new Map<string, number>();
  columns.forEach((column) => typeTotals.set(column.type, (typeTotals.get(column.type) ?? 0) + 1));
  const distribution = [...typeTotals.entries()].map(([name, count]) => ({
    name,
    value: Math.round((count / columns.length) * 100),
    color: COLORS[name] ?? COLORS.Other,
  }));

  return {
    name: file.name,
    rows: rows.length,
    columns,
    missingCells,
    duplicateRows,
    quality,
    distribution,
  };
}

workerScope.onmessage = async ({ data: file }) => {
  try {
    const profile = await profileFile(file);
    workerScope.postMessage({ ok: true, profile });
  } catch (error) {
    workerScope.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : "Could not read this CSV file.",
    });
  }
};
