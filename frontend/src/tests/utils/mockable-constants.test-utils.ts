// Values used during unit testing for the constants in
// frontend/src/lib/constants/mockable.constants.ts
import type * as mockableConstants from "$lib/constants/mockable.constants";

type MockableConstantsKey = keyof typeof mockableConstants;
type MockableConstants = { [K in MockableConstantsKey]: unknown };

// Default values are set from vi-setup.ts:
let defaultTestConstants: MockableConstants;

export const mockedConstants: MockableConstants = {
  DEV: undefined,
  ENABLE_METRICS: undefined,
  FORCE_CALL_STRATEGY: undefined,
  IS_TEST_ENV: undefined,
  QR_CODE_RENDERED_DEFAULT_STATE: undefined,
  ENABLE_QR_CODE_READER: undefined,
};

export const resetMockedConstants = () => {
  Object.keys(mockedConstants).forEach((key) => {
    mockedConstants[key] = defaultTestConstants[key];
  });
};

export const setDefaultTestConstants = (constants: MockableConstants) => {
  defaultTestConstants = constants;
  resetMockedConstants();
};
