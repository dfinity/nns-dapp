import inject from "@rollup/plugin-inject";
import { sveltekit } from "@sveltejs/kit/vite";
import { readFileSync } from "fs";
import { basename, dirname } from "path";
import { fileURLToPath } from "url";
import type { UserConfig } from "vite";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const { version } = JSON.parse(json);

const config: UserConfig = {
  plugins: [sveltekit()],
  build: {
    target: "es2020",
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const folder = dirname(id);

          // Buffer polyfill is used by various libraries (agent-js, QR code, ledger etc.). That's why we create a specific chunk.
          if (
            basename(folder) === "buffer" &&
            folder.match(/node_modules/g)?.length === 1
          ) {
            return "buffer";
          }

          if (
            ["html5-qrcode", "qr-creator"].find((lib) =>
              folder.includes(lib)
            ) !== undefined &&
            folder.includes("node_modules")
          ) {
            return "qr";
          }

          if (
            ["@ledgerhq", "@zondax/ledger-icp"].find((lib) =>
              folder.includes(lib)
            ) !== undefined &&
            folder.includes("node_modules")
          ) {
            return "ledger-hw";
          }

          // The protobuf files are required only when the hardware wallet is used
          if (
            ["@dfinity/nns-proto"].find((lib) => folder.includes(lib)) !==
              undefined &&
            folder.includes("node_modules")
          ) {
            return "nns-proto";
          }

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
              "frontend/src/lib/api-services",
              "frontend/src/lib/canisters",
              "frontend/src/lib/constants",
              "frontend/src/lib/derived",
              "frontend/src/lib/identities",
              "frontend/src/lib/keys",
              "frontend/src/lib/proxy",
              "frontend/src/lib/rest",
              "frontend/src/lib/services",
              "frontend/src/lib/stores",
              "frontend/src/lib/types",
              "frontend/src/lib/utils",
              "frontend/src/lib/worker-api",
              "frontend/src/lib/worker-services",
              "frontend/src/lib/worker-utils",
              "frontend/src/lib/workers",
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
  worker: {
    format: "es",
  },
};

export default config;
