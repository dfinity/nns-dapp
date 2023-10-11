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
      reporters: ["basic", "hanging-process"],
      sequence: {
        hooks: "list",
      },
      // Vitest: https://github.com/vitest-dev/vitest/issues/2008#issuecomment-1436415644
      // Some threads remain open when we run the test suite locally or in the CI, which causes vitest to hang forever.
      // Following stacktrace can for example finds place:
      //
      // > # FILEHANDLE
      // > node:internal/async_hooks:202
      // > close timed out after 30000ms
      // > Failed to terminate worker while running /nns-dapp/frontend/src/vitests/lib/components/project-detail/ProjectCommitment.spec.ts.
      // > Tests closed successfully but something prevents Vite server from exiting
      // > You can try to identify the cause by enabling "hanging-process" reporter. See https://vitest.dev/config/#reporters
      //
      // Use atomics to synchronize threads seem to resolve the issue according our tests.
      // https://vitest.dev/config/#pooloptions-threads-useatomics
      useAtomics: true,
    },
  })
);
