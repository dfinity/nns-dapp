export const DEV = import.meta.env.DEV;

// Disable TVL or transaction rate warning locally because that information is not crucial when we develop
export const ENABLE_METRICS = !DEV;

export const FORCE_CALL_STRATEGY: "query" | undefined = undefined;

export const IS_TEST_ENV = process.env.NODE_ENV === "test";

// When the QR code is rendered (draw), it triggers an event that is replicated to a property to get to know if the QR code has been or not rendered.
// We use a constant / environment variable that way, we can mock it to `true` for test purpose.
// Jest has trouble loading the QR-code dependency and because the QR-code content is anyway covered by e2e snapshot testing in gix-cmp.
export const QR_CODE_RENDERED_DEFAULT_STATE = false;

// Here too, Jest has trouble loading the QR-code reader dependency asynchronously (`await import ("")`).
// npm run test leads to error -> segmentation fault  npm run test src/tests/lib/modals/transaction/TransactionModal.spec.ts
// That's why we use a constant / environment variable that way, we can mock it to `false` for test purpose.
export const ENABLE_QR_CODE_READER = true;
