import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
import inject from "@rollup/plugin-inject";
import json from "@rollup/plugin-json";

const production = !process.env.ROLLUP_WATCH;

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

export default {
  input: "src/main.ts",
  output: {
    sourcemap: true,
    format: "es",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: "bundle.css" }),

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
      sourceMap: !production,
      inlineSources: !production,
    }),
    inject({ Buffer: ["buffer", "Buffer"] }),
    json(),
    replace({
      preventAssignment: true,
      "process.env.ROLLUP_WATCH": !!process.env.ROLLUP_WATCH,
      "process.env.INTERNET_IDENTITY_URL": JSON.stringify(
        process.env.INTERNET_IDENTITY_URL ||
          (process.env.DEPLOY_ENV === "testnet"
            ? "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/"
            : "https://identity.ic0.app/")
      ),
      // When developing with live reload in svelte, redirecting to flutter is
      // not desirable, so when there is no deployment target we don't do it.
      // More direct control is possible by setting the environment variable
      // REDIRECT_TO_LEGACY to true or false when building.
      "process.env.REDIRECT_TO_LEGACY": JSON.stringify(
        process.env.REDIRECT_TO_LEGACY === undefined
          ? process.env.DEPLOY_ENV !== undefined
          : !process.env.REDIRECT_TO_LEGACY.match(/^(false|no)$/i)
      ),
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
