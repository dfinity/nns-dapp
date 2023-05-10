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
