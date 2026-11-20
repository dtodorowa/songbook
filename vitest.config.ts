import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pure logic only, without the SvelteKit plugin, so `$lib` is aliased by hand.
export default defineConfig({
  resolve: {
    alias: { $lib: fileURLToPath(new URL("./src/lib", import.meta.url)) },
  },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
