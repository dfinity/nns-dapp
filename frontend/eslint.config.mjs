import jsLint from "@eslint/js";
import prettierPlugin from "eslint-config-prettier";
import sveltePlugin from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tsLint from "typescript-eslint";

export default [
  jsLint.configs.recommended,
  ...tsLint.configs.recommended,
  {
    name: "globals",
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        NodeJS: true,
      },
      parser: tsLint.parser,
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        extraFileExtensions: [".svelte"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-underscore-dangle": "off",
      // TODO: Fix after migration
      "no-constant-binary-expression": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  ...sveltePlugin.configs["flat/recommended"],
  {
    name: "svelte",
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      sourceType: "script",
      parserOptions: {
        parser: tsLint.parser,
        // svelteConfig: svelteConfig,
      },
    },
  },
  prettierPlugin,
  {
    name: "ignores",
    ignores: [
      // ignorePatterns
      "src/lib/canisters/**/*",
      // .eslintignore
      "**/.DS_Store",
      // "node_modules/*",
      "build",
      ".svelte-kit",
      "package",
      "playwright*",
      "**/.env",
      "**/.env.*",
      "!**/.env.example",
      // Ignore files for PNPM, NPM and YARN
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",

      "static",
      "public",
      "scripts",

      "src/lib/canisters/nns-dapp/**/*",

      "**/coverage",
    ],
  },
];
