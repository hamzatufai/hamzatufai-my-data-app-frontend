import { Suspense } from "react";
import ProfilingClient from "./ProfilingClient";

export default function ProfilingPage() {
  return (
    <Suspense>
      <ProfilingClient />
    </Suspense>
  );
}
