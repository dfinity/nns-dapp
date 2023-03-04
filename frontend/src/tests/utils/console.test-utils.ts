const realConsoleLog = console.log;
const realConsoleDebug = console.debug;
const realConsoleError = console.error;

let gotLogs = false;
let isLoggingAllowed = false;

export const failTestsThatLogToConsole = () => {
  global.beforeEach(() => {
    gotLogs = false;
    jest.spyOn(console, "log").mockImplementation((...args) => {
      gotLogs = true;
      realConsoleLog(...args);
    });
    jest.spyOn(console, "debug").mockImplementation((...args) => {
      gotLogs = true;
      realConsoleDebug(...args);
    });
    jest.spyOn(console, "error").mockImplementation((...args) => {
      gotLogs = true;
      realConsoleError(...args, new Error().stack);
    });
  });

  global.afterEach(() => {
    if (!isLoggingAllowed && gotLogs) {
      throw new Error(
        "Your test passed but produced console logs, which is not allowed.\n" +
          "If you need console output, mock and expect it in your test.\n" +
          "If this is only for debugging, call allowLoggingInOneTest" +
          "ForDebugging() from src/tests/utils/console.test-utils in your test."
      );
    }
    isLoggingAllowed = false;
  });
};

// Use this only when debugging but don't commit.
export const allowLoggingInOneTestForDebugging = () => {
  isLoggingAllowed = true;
};
