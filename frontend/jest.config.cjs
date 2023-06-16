module.exports = {
  transform: {
    "^.+\\.svelte$": [
      "svelte-jester",
      { preprocess: "./svelte.config.test.cjs" },
    ],
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.spec.json",
      },
    ],
    "\\.(svg|png)$": "<rootDir>/jest-transform.cjs",
  },
  moduleFileExtensions: ["js", "ts", "svelte"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts", "<rootDir>/jest-spy.ts"],
  collectCoverageFrom: ["src/**/*.{ts,tsx,svelte,js,jsx}"],
  testEnvironmentOptions: {
    url: "https://nns.internetcomputer.org/",
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(@dfinity/gix-components))",
  ],
  moduleNameMapper: {
    "^\\$lib/(.*)$": "<rootDir>/src/lib/$1",
    "^\\$routes/(.*)$": "<rootDir>/src/routes/$1",
    "^\\$mocks/(.*)$": "<rootDir>/__mocks__/$1",
    "^\\$tests/(.*)$": "<rootDir>/src/tests/$1",
    "@dfinity/gix-components":
      "<rootDir>/node_modules/@dfinity/gix-components/dist",
  },
  resolver: "<rootDir>/jest-resolver.cjs",
  setupFiles: ["fake-indexeddb/auto"],
  testPathIgnorePatterns: ["<rootDir>/src/tests/e2e/"],
};
