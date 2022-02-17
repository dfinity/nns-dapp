module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    // "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    extraFileExtensions: [".svelte"],
    types: ["jest"],
  },
  env: {
    es6: true,
    browser: true,
  },
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
    },
    {
      files: ["*.spec.ts"],
      env: {
        jest: true,
      },
    },
  ],
  settings: {
    "svelte3/typescript": () => require("typescript"),
  },
  plugins: ["svelte3", "@typescript-eslint"],
  ignorePatterns: ["node_modules", ".eslintrc.js"],
  rules: {},
};
