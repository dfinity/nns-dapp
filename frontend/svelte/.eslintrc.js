module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // TODO: Enable once we fix issues from above
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
    extraFileExtensions: [".svelte"],
    types: ["jest"],
  },
  env: {
    es6: true,
    browser: true,
    node: true,
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
  rules: {
    // https://typescript-eslint.io/rules/no-inferrable-types/
    "@typescript-eslint/no-inferrable-types": 0,
    // This allows to use `async` functions also in function types that expect `void`.
    // https://typescript-eslint.io/rules/no-misused-promises
    "@typescript-eslint/no-misused-promises": [0, { checksVoidReturn: 0 }],
    "@typescript-eslint/strict-boolean-expressions": [
      2,
      {
        allowString: false,
        allowNumber: false,
      },
    ],
    "@typescript-eslint/ban-ts-comment": [
      2,
      {
        "ts-ignore": "allow-with-description",
      },
    ],
  },
};
