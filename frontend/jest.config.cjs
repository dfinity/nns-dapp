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
  testPathIgnorePatterns: ["nns-js"],
  testEnvironmentOptions: {
    url: "https://nns.ic0.app/",
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(@dfinity/gix-components))",
  ]
};
