import { sveltekit } from "@sveltejs/kit/vite";
import { resolve } from "path";
import { UserConfig } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig(
  ({ mode }: UserConfig): UserConfig => ({
    plugins: [sveltekit()],
    resolve: {
      alias: {
        $lib: resolve(__dirname, "src/lib"),
        $routes: resolve(__dirname, "src/routes"),
        $mocks: resolve(__dirname, "src/__mocks__"),
        $tests: resolve(__dirname, "src/tests"),
        "@dfinity/gix-components": resolve(
          __dirname,
          "node_modules/@dfinity/gix-components"
        ),
      },
    },
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
      deps: {
        inline: ["@dfinity/gix-components"],
      },
    },
  })
);
