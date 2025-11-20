import { sveltekit } from "@sveltejs/kit/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { resolve } from "path";
import type { UserConfig } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig(
  ({ mode }: UserConfig): UserConfig => ({
    plugins: [sveltekit(), svelteTesting()],
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
      environmentOptions: {
        jsdom: {
          url: "https://nns.internetcomputer.org/",
        },
      },
      exclude: [
        ...configDefaults.exclude,
        ...(mode === "test" ? ["./src/tests/e2e/**/*"] : []),
      ],
      include: [
        ...(mode === "e2e"
          ? ["./src/tests/e2e/**/*"]
          : ["./src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"]),
      ],
      globals: true,
      watch: false,
      setupFiles: ["./vitest.setup.ts"],
      globalSetup: ["./vitest.global-setup.ts"],
      // Resolve for example Cannot redefine property: SnsWrapper
      //  ❯ src/tests/lib/services/sns-sale.services.spec.ts
      // vi.spyOn(dfinitySns, "SnsWrapper").mockReturnValue(...
      // https://github.com/vitest-dev/vitest/issues/5625#issuecomment-2078969371
      server: {
        deps: {
          inline: ["@dfinity/sns", "@dfinity/utils"],
        },
      },
      reporters: ["default", "hanging-process"],
      sequence: {
        hooks: "list",
      },
      coverage: {
        provider: "v8",
        exclude: ["playwright-report", "public", "**/.svelte-kit"],
      },
    },
  })
);
