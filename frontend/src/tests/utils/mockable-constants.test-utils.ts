// Values used during unit testing for the constants in
// frontend/src/lib/constants/mockable.constants.ts

import type * as mockableConstants from "$lib/constants/mockable.constants";
import { registerCleanupForTesting } from "$lib/utils/test-support.utils";

type MockableConstantsKey = keyof typeof mockableConstants;
type MockableConstants = { [K in MockableConstantsKey]: unknown };

// Default values are set from jest-setup.ts:
let defaultTestConstants: MockableConstants;

export const mockedConstants: MockableConstants = {
  DEV: undefined,
  FORCE_CALL_STRATEGY: undefined,
  IS_TEST_ENV: undefined,
  QR_CODE_RENDERED_DEFAULT_STATE: undefined,
  ENABLE_QR_CODE_READER: undefined,
  isForceCallStrategy: undefined,
  notForceCallStrategy: undefined,
};

const resetMockedConstants = () => {
  Object.keys(mockedConstants).forEach((key) => {
    mockedConstants[key] = defaultTestConstants[key];
  });
};

export const setDefaultTestConstants = (constants: MockableConstants) => {
  defaultTestConstants = constants;
  resetMockedConstants();
};

registerCleanupForTesting(resetMockedConstants);
