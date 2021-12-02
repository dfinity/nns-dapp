module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: [`<rootDir>/test-setup.ts`],
  modulePathIgnorePatterns: ["./dist"],
};
