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
      realConsoleError(...args);
    });
  });

  global.afterEach(() => {
    if (!isLoggingAllowed) {
      expect(
        gotLogs,
        "Your tests produced console logs, which is not allowed.\n" +
        "If you need console output, mock and expect it in your test.\n" +
        "If this is only for debugging, call allowLoggingInOneTest() from " +
        "src/tests/mocks/console.mock in your test."
      ).toBe(false);
    }
    isLoggingAllowed = false;
  });
};

// Use this only when debugging but don't commit.
export const allowLoggingInOneTest = () => {
  isLoggingAllowed = true;
};
