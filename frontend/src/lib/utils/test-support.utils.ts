// The purpose of this function is to be mocked by tests.
//
// Production code should use this function to register cleanup functions that
// should be run before each test.
export const registerCleanupForTesting = (cleanup: () => void) => {};
