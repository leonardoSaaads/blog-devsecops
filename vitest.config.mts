import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside the Next bundler; in tests it is a no-op.
      "server-only": fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
      // Next components replaced by minimal versions outside the framework.
      "next/link": fileURLToPath(new URL("./src/test/mocks/next-link.tsx", import.meta.url)),
      "next/image": fileURLToPath(new URL("./src/test/mocks/next-image.tsx", import.meta.url)),
      "next/navigation": fileURLToPath(
        new URL("./src/test/mocks/next-navigation.ts", import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/**"],
      exclude: ["**/*.test.*", "src/test/**", "src/app/**"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
