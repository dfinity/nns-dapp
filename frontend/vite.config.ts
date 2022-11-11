import inject from "@rollup/plugin-inject";
import { sveltekit } from "@sveltejs/kit/vite";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import type { UserConfig } from "vite";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const { version } = JSON.parse(json);

const config: UserConfig = {
  plugins: [sveltekit()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const folder = dirname(id);

          if (
            ["@sveltejs", "svelte", "@dfinity/gix-components"].find((lib) =>
              folder.includes(lib)
            ) === undefined &&
            folder.includes("node_modules")
          ) {
            return "vendor";
          }

          if (
            [
              "frontend/src/lib/api",
              "frontend/src/lib/canisters",
              "frontend/src/lib/constants",
              "frontend/src/lib/derived",
              "frontend/src/lib/identities",
              "frontend/src/lib/keys",
              "frontend/src/lib/proxy",
              "frontend/src/lib/services",
              "frontend/src/lib/stores",
              "frontend/src/lib/types",
              "frontend/src/lib/utils",
            ].find((module) => folder.includes(module)) !== undefined
          ) {
            return "dapp";
          }
        },
      },
      // Polyfill Buffer for production build. The hardware wallet needs Buffer.
      plugins: [
        inject({
          include: ["node_modules/@ledgerhq/**"],
          modules: { Buffer: ["buffer", "Buffer"] },
        }),
      ],
    },
  },
  define: {
    VITE_APP_VERSION: JSON.stringify(version),
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
};

export default config;
