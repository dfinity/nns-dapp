import inject from "@rollup/plugin-inject";
import { sveltekit } from "@sveltejs/kit/vite";
import { readFileSync } from "fs";
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
          if (
            [
              "@dfinity/nns",
              "@dfinity/sns",
              "@dfinity/utils",
              "@dfinity/cmc",
            ].find((module) => id.includes(module)) !== undefined
          ) {
            return "ic";
          } else if (
            [
              "@dfinity/agent",
              "@dfinity/auth-client",
              "@dfinity/authentication",
              "@dfinity/candid",
              "@dfinity/identity",
              "@dfinity/principal",
            ].find((module) => id.includes(module)) !== undefined
          ) {
            return "agent";
          } else if (
            ["svelte", "@dfinity/gix-components"].find((module) =>
              id.includes(module)
            ) === undefined &&
            id.includes("node_modules")
          ) {
            return "vendor";
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
