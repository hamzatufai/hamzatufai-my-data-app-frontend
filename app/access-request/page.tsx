import { Suspense } from "react";
import AccessRequestClient from "./AccessRequestClient";

export default function AccessRequestPage() {
  return (
    <Suspense>
      <AccessRequestClient />
    </Suspense>
  );
}
