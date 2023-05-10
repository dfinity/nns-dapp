import { UserConfig } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig(
  ({ mode }: UserConfig): UserConfig => ({
    test: {
      environment: "jsdom",
      exclude: [
        ...configDefaults.exclude,
        ...(mode === "test" ? ["./src/tests/e2e/**/*"] : []),
      ],
      include: [
        ...configDefaults.include,
        ...(mode === "e2e" ? ["./src/tests/e2e/**/*"] : []),
      ],
      globals: true,
      watch: false,
      setupFiles: ["./jest-setup.ts", "./jest-spy.ts"],
    },
  })
);
