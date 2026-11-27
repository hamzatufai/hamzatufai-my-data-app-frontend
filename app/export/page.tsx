import { Suspense } from "react";
import ExportClient from "./ExportClient";

export default function ExportPage() {
  return (
    <Suspense>
      <ExportClient />
    </Suspense>
  );
}
