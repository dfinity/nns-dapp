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
      // Polyfill Buffer for production build. The hardware wallet needs Buffer.
      plugins: [inject({
        include: ['node_modules/@ledgerhq/**'],
        modules: { Buffer: ['buffer', 'Buffer'], }
      })],
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
