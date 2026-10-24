"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * A value only available on the client (e.g., local date, browser APIs).
 * During server rendering and hydration it uses `serverValue`, avoiding an HTML mismatch.
 */
export function useClientValue<T>(getClientValue: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getClientValue, () => serverValue);
}
