import { vi } from "vitest";

/** Test stand-in for `next/navigation`. */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
};
export const useRouter = () => routerMock;
export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams(globalThis.location?.search ?? "");
export const notFound = () => {
  throw new Error("NEXT_NOT_FOUND");
};
