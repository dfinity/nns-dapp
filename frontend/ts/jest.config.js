module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules"],
  modulePathIgnorePatterns: ["./build"],
  setupFiles: [`<rootDir>/test-setup.ts`],
};
