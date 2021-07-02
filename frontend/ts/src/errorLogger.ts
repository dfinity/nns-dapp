// We need this because currently the error details get lost upon reaching the dart code.
export const executeWithLogging = async <T>(
  func: () => Promise<T>
): Promise<T> => {
  try {
    return await func();
  } catch (e) {
    console.log(e);
    throw e;
  }
};
