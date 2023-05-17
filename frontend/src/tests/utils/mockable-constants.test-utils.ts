// Values used during unit testing for the constants in
// frontend/src/lib/constants/mockable.constants.ts

const defaultTestConstants = {
  DEV: false,
  ENABLE_METRICS: false,
  FORCE_CALL_STRATEGY: undefined,
  IS_TEST_ENV: true,
  QR_CODE_RENDERED_DEFAULT_STATE: true,
  ENABLE_QR_CODE_READER: false,
};

export const mockedConstants = { ...defaultTestConstants };

export const resetMockedConstants = () => {
  Object.keys(mockedConstants).forEach((key) => {
    mockedConstants[key] = defaultTestConstants[key];
  });
};
