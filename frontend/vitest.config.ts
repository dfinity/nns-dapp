import { sveltekit } from "@sveltejs/kit/vite";
import { resolve } from "path";
import type { UserConfig } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig(
  ({ mode }: UserConfig): UserConfig => ({
    plugins: [sveltekit()],
    resolve: {
      alias: [
        {
          find: "$lib",
          replacement: resolve(__dirname, "src/lib"),
        },
        {
          find: "$routes",
          replacement: resolve(__dirname, "src/routes"),
        },
        {
          find: "$tests",
          replacement: resolve(__dirname, "src/tests"),
        },
        {
          find: "$vitests",
          replacement: resolve(__dirname, "src/vitests"),
        },
        {
          find: "$mocks",
          replacement: resolve(__dirname, "__mocks__"),
        },
        {
          find: "@dfinity/gix-components",
          replacement: resolve(
            __dirname,
            "node_modules/@dfinity/gix-components"
          ),
        },
        // vitest issue https://github.com/vitest-dev/vitest/issues/2834#issuecomment-1425371719
        {
          find: /svelte\/ssr.mjs/,
          replacement: "svelte/index.mjs",
        },
      ],
    },
    test: {
      environment: "jsdom",
      exclude: [
        ...configDefaults.exclude,
        ...(mode === "test" ? ["./src/tests/e2e/**/*"] : []),
      ],
      include: [
        // TODO: uncomment default config and remove **/vitests/** include pattern when migration over
        // ...configDefaults.include,
        ...(mode === "e2e"
          ? ["./src/tests/e2e/**/*"]
          : ["**/vitests/**/*.{test,spec}.?(c|m)[jt]s?(x)"]),
      ],
      globals: true,
      watch: false,
      setupFiles: ["./vitest.setup.ts"],
      deps: {
        optimizer: {
          ssr: {
            include: ["@dfinity/gix-components"],
          },
        },
      },
      // Vitest issue: https://github.com/vitest-dev/vitest/issues/2834#issuecomment-1439576110
      alias: [{ find: /^svelte$/, replacement: "svelte/internal" }],
      poolMatchGlobs: [["**/vitests/**", "child_process"]],
    },
  })
);
