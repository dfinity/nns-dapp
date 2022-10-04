module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.spec.json",
    },
  },
  transform: {
    "^.+\\.svelte$": [
      "svelte-jester",
      { preprocess: "./svelte.config.test.cjs" },
    ],
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts", "svelte"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts", "<rootDir>/jest-spy.ts"],
  collectCoverageFrom: ["src/**/*.{ts,tsx,svelte,js,jsx}"],
  testEnvironmentOptions: {
    url: "https://nns.ic0.app/",
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(@dfinity/gix-components))",
  ],
  moduleNameMapper: { "^\\$lib(.*)$": "<rootDir>/src/lib$1" },
  setupFiles: ["fake-indexeddb/auto"],
};
