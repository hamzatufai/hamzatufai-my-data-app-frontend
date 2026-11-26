export type ProfileColumn = {
  name: string;
  type: string;
  nullPct: number;
  quality: number;
};

export type DatasetProfile = {
  id: string;
  name: string;
  importedAt: string;
  rows: number;
  columns: ProfileColumn[];
  missingCells: number;
  duplicateRows: number;
  quality: number;
  distribution: { name: string; value: number; color: string }[];
};

const STORAGE_KEY = "cleancsv:profiles:v1";
const CHANGE_EVENT = "cleancsv:profiles-updated";
const EMPTY_PROFILES: DatasetProfile[] = [];
let cachedProfiles: DatasetProfile[] | null = null;

function isDatasetProfile(value: unknown): value is DatasetProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<DatasetProfile>;
  return (
    typeof profile.id === "string" &&
    typeof profile.name === "string" &&
    typeof profile.importedAt === "string" &&
    Number.isFinite(profile.rows) &&
    Number.isFinite(profile.quality) &&
    Array.isArray(profile.columns) &&
    Array.isArray(profile.distribution)
  );
}

export function getProfilesSnapshot(): DatasetProfile[] {
  if (typeof window === "undefined") return EMPTY_PROFILES;
  if (cachedProfiles) return cachedProfiles;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    cachedProfiles = Array.isArray(parsed) ? parsed.filter(isDatasetProfile) : [];
  } catch {
    cachedProfiles = [];
  }

  return cachedProfiles;
}

export function subscribeToProfiles(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cachedProfiles = null;
      onChange();
    }
  };

  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getServerProfilesSnapshot(): DatasetProfile[] {
  return EMPTY_PROFILES;
}

export function saveProfile(profile: DatasetProfile): void {
  const next = [...getProfilesSnapshot(), profile].slice(-100);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedProfiles = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function removeProfile(profileId: string): void {
  const next = getProfilesSnapshot().filter((profile) => profile.id !== profileId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedProfiles = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
