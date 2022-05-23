module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:wdio/recommended",
    "plugin:@typescript-eslint/recommended",
    // TODO: Enable once we fix issues from above
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
    types: ["jest"],
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  // vars in `global.d.ts`
  globals: {
    InputEventHandler: "readonly",
  },
  overrides: [
    {
      files: ["*.spec.ts"],
      env: {
        jest: true,
      },
    },
  ],
  plugins: ["@typescript-eslint", "eslint-plugin-wdio"],
  ignorePatterns: ["node_modules", ".eslintrc.js"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "warn",
    // https://typescript-eslint.io/rules/no-inferrable-types/
    "@typescript-eslint/no-inferrable-types": 0,
    // This allows to use `async` functions also in function types that expect `void`.
    // https://typescript-eslint.io/rules/no-misused-promises
    "@typescript-eslint/no-misused-promises": [0, { checksVoidReturn: 0 }],
    "@typescript-eslint/no-var-requires": [0],
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
    "@typescript-eslint/no-unused-vars": [
      "warn", // or error
      {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "wdio/no-pause": [0],
  },
};
