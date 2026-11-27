import { Suspense } from "react";
import StatusClient from "./StatusClient";

export default function StatusPage() {
  return (
    <Suspense>
      <StatusClient />
    </Suspense>
  );
}
