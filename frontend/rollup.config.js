import commonjs from "@rollup/plugin-commonjs";
import inject from "@rollup/plugin-inject";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import OMT from "@surma/rollup-plugin-off-main-thread";
import * as fs from "fs";
import css from "rollup-plugin-css-only";
import livereload from "rollup-plugin-livereload";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import { envConfig } from "./env.config.mjs";

const { ENVIRONMENT } = envConfig;
const prodBuild = ENVIRONMENT !== "local";

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

const replaceMap = [
  "ROLLUP_WATCH",
  "IDENTITY_SERVICE_URL",
  "DFX_NETWORK",
  "FETCH_ROOT_KEY",
  "FEATURE_FLAGS",
  "HOST",
  "OWN_CANISTER_ID",
  "LEDGER_CANISTER_ID",
  "GOVERNANCE_CANISTER_ID",
  "CYCLES_MINTING_CANISTER_ID",
  "WASM_CANISTER_ID",
].reduce(
  (acc, key) => {
    // Each key is transferred from envConfig as a string.
    // Theoretically it is possible to pass other types, such as a bool, however
    // the linter assumes that process.env.X is a string so it is best to comply.
    let value = envConfig[key];
    if (undefined === value) {
      throw new Error(`In rollup, envConfig[${key}] is undefined.`);
    }

    // Technically speaking we would be able to assign the object without having to stringify it but, jest test does not use rollup and can only assign string to process.env.
    // That's why here too, we stringify the object.
    acc[`process.env.${key}`] = JSON.stringify(
      typeof value === "object" ? JSON.stringify(value) : String(value)
    );
    return acc;
  },
  {
    // This is a rollup configuration, it is not inserted into the compiled code.
    // Quote: @rollup/plugin-replace: 'preventAssignment' currently defaults to false.
    //        It is recommended to set this option to true, as the next major version
    //        will default this option to true.
    preventAssignment: true,
  }
);

const configApp = {
  input: "src/main.ts",
  output: {
    sourcemap: !prodBuild,
    format: "es",
    name: "app",
    dir: "public/build/",
    manualChunks: {
      nns: ["@dfinity/nns"],
      agent: [
        "@dfinity/agent",
        "@dfinity/auth-client",
        "@dfinity/authentication",
        "@dfinity/candid",
        "@dfinity/identity",
        "@dfinity/principal",
      ],
      sns: ["@dfinity/sns"],
    },
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !prodBuild,
        postcss: {
          plugins: [require("autoprefixer")()],
        },
      }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !prodBuild,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({
      output: (styles, stylesNodes) => {
        // Here we sort the CSS content to ensure reproducibility, see
        // https://github.com/thgh/rollup-plugin-css-only/issues/42.
        if (!fs.existsSync("public/build")) {
          fs.mkdirSync("public/build", { recursive: true });
        }
        fs.writeFileSync(
          "public/build/bundle.css",
          // stylesNodes is a map from filename (e.g.
          // 'src/lib/components/ui/FiltersCard.css') to css content (e.g.
          // '.filter.svelte-1f2mdt{display:flex;justify-content:space-between;...').
          Object.values(stylesNodes).sort().join("")
        );
      },
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      preferBuiltins: false,
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !prodBuild,
      inlineSources: !prodBuild,
    }),
    inject({ Buffer: ["buffer", "Buffer"] }),
    json(),
    replace(replaceMap),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !prodBuild && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !prodBuild && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    prodBuild && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

const configWorker = {
  input: "src/worker.ts",
  output: {
    sourcemap: false,
    format: "amd",
    file: "public/build/worker.js",
  },
  plugins: [
    resolve({
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    typescript({
      sourceMap: !prodBuild,
      inlineSources: !prodBuild,
    }),
    json(),
    replace(replaceMap),
    OMT(),
  ],
};

export default [configApp, configWorker];
