"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Valor disponível apenas no cliente (ex.: data local, APIs do navegador).
 * No servidor e na hidratação usa `serverValue`, evitando divergência de HTML.
 */
export function useClientValue<T>(getClientValue: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getClientValue, () => serverValue);
}
