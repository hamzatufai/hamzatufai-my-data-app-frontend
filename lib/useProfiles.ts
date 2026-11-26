"use client";

import { useSyncExternalStore } from "react";
import {
  getProfilesSnapshot,
  getServerProfilesSnapshot,
  subscribeToProfiles,
} from "@/lib/profiles";

export function useProfiles() {
  return useSyncExternalStore(
    subscribeToProfiles,
    getProfilesSnapshot,
    getServerProfilesSnapshot,
  );
}
