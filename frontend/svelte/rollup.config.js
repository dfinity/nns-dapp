import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import cssbundle from 'rollup-plugin-css-bundle';
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
      preprocess: sveltePreprocess({
        sourceMap: !production,
        postcss: {
          plugins: [require("autoprefixer")()],
        },
      }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    cssbundle(),

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
      "process.env.IDENTITY_SERVICE_URL": JSON.stringify(
        process.env.IDENTITY_SERVICE_URL ||
          (process.env.DEPLOY_ENV === "testnet"
            ? "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/"
            : "https://identity.ic0.app/")
      ),
      "process.env.DEPLOY_ENV": JSON.stringify(process.env.DEPLOY_ENV),
      // When developing with live reload in svelte, redirecting to flutter is
      // not desirable.  The default should match production:
      // - false while svelte is inactive
      // - true while flutter is being replaced by svelte
      // - false after flutter has been replaced, but before all scaffolding has been removed
      // - the flag may then be removed.
      "process.env.REDIRECT_TO_LEGACY": JSON.stringify(
        ["true", "1"].includes(process.env.REDIRECT_TO_LEGACY)
          ? true
          : ["false", "0"].includes(process.env.REDIRECT_TO_LEGACY)
          ? false
          : true // default
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
