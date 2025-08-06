import path from "path";
import type { UserConfig as Config } from "vitest/config";

const config: Config = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
};

export default config;
