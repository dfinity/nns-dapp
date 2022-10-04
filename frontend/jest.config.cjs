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
  },
  moduleFileExtensions: ["js", "ts", "svelte"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts", "<rootDir>/jest-spy.ts"],
  collectCoverageFrom: ["src/**/*.{ts,tsx,svelte,js,jsx}"],
  testPathIgnorePatterns: ["nns-js"],
  testEnvironmentOptions: {
    url: "https://nns.ic0.app/",
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(@dfinity/gix-components))",
  ],
  setupFiles: ["fake-indexeddb/auto"],
};
