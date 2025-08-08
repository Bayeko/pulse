import path from "path";
import type { UserConfig as Config } from "vitest/config";

const config: Config = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
};

export default config;
