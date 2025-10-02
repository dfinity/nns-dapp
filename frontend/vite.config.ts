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
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const folder = dirname(id);

          const lazy = [
            "html5-qrcode",
            "qr-creator",
            "@ledgerhq",
            "@zondax/ledger-icp",
            "marked",
          ];

          if (
            ["@sveltejs", "svelte", "@dfinity/gix-components", ...lazy].find(
              (lib) => folder.includes(lib)
            ) === undefined &&
            folder.includes("node_modules")
          ) {
            return "vendor";
          }

          if (
            lazy.find((lib) => folder.includes(lib)) !== undefined &&
            folder.includes("node_modules")
          ) {
            return "lazy";
          }

          return "index";
        },
      },
    },
  },
  define: {
    VITE_APP_VERSION: JSON.stringify(version),
  },
  worker: {
    format: "es",
  },
};

export default config;
