// These are constants that can have a different value during tests but which are not set with the arguments passed to the canister.
// Tests can override these constants by setting them on the mockedConstants
// object in frontend/src/tests/utils/mockable-constants.test-utils.ts
// Their default values during unit tests are defined in jest-setup.ts.

export const DEV = import.meta.env.DEV;

// We use FORCE_CALL_STRATEGY to turn query+update into just a query call in a
// number of places. We want to go back to doing query+update calls in all these
// places. We want to do this as a percentage rollout.
//
//   0: means we still do only query calls in these places.
// 100: means we do query+update calls in all these places.
//  10: means we do query+update calls in these places for 10% of sessions.
//
// Whether we do query+update calls remains fixed for the duration of the
// sessions, by which we mean until the next time the app/page is reloaded.
const RESTORE_QUERY_AND_UPDATE_ROLLOUT_PERCENTAGE: number = 10;

const getForceCallStrategyForPercentage = (
  percentage: number
): undefined | "query" => {
  // Treat 0 and 100 explicitly to avoid edge cases.
  if (percentage === 0) {
    return "query";
  }
  if (percentage === 100) {
    return undefined;
  }
  return Math.random() * 100 <= percentage ? undefined : "query";
};

const initForceCallStrategy = (): undefined | "query" => {
  const strategy = getForceCallStrategyForPercentage(
    RESTORE_QUERY_AND_UPDATE_ROLLOUT_PERCENTAGE
  );
  console.info("FORCE_CALL_STRATEGY is initialized to:", strategy);
  return strategy;
};

export const FORCE_CALL_STRATEGY: "query" | undefined = initForceCallStrategy();

export const isForceCallStrategy = (): boolean =>
  FORCE_CALL_STRATEGY === "query";

export const notForceCallStrategy = (): boolean => !isForceCallStrategy();

export const IS_TEST_ENV = process.env.NODE_ENV === "test";

// When the QR code is rendered (draw), it triggers an event that is replicated to a property to get to know if the QR code has been or not rendered.
// We use a constant / environment variable that way, we can mock it to `true` for test purpose.
// Jest has trouble loading the QR-code dependency and because the QR-code content is anyway covered by e2e snapshot testing in gix-cmp.
export const QR_CODE_RENDERED_DEFAULT_STATE = false;

// Here too, Jest has trouble loading the QR-code reader dependency asynchronously (`await import ("")`).
// npm run test leads to error -> segmentation fault  npm run test src/tests/lib/modals/transaction/TransactionModal.spec.ts
// That's why we use a constant / environment variable that way, we can mock it to `false` for test purpose.
export const ENABLE_QR_CODE_READER = true;
