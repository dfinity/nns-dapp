type LogType = "log" | "debug" | "warn" | "error";

const logTypes: LogType[] = ["log", "debug", "warn", "error"];

for (const logType of logTypes) {
  replaceRealLogger(logType);
}

let gotLogs = false;
let isLoggingAllowed = false;

function replaceRealLogger(logType: LogType) {
  const realLogger = console[logType];
  console[logType] = function (...args) {
    gotLogs = true;
    realLogger(...args);
  };
}

export const failTestsThatLogToConsole = () => {
  global.beforeEach(() => {
    gotLogs = false;
  });

  global.afterEach(() => {
    if (!isLoggingAllowed && gotLogs) {
      throw new Error(
        "Your test produced console logs, which is not allowed.\n" +
          "If you need console output, mock and expect it in your test.\n" +
          "This failure only happens after your test finishes so if your test had other failures, you can still see them and just ignore this.\n" +
          "If this is only for debugging, call allowLoggingInOneTest" +
          "ForDebugging() from $tests/utils/console.test-utils in your test."
      );
    }
    isLoggingAllowed = false;
  });
};

// Use this only when debugging but don't commit.
export const allowLoggingInOneTestForDebugging = () => {
  isLoggingAllowed = true;
};
