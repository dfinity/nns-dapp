export const envConfig = {
  PRODUCTION: !process.env.ROLLUP_WATCH,
  IDENTITY_SERVICE_URL:
    process.env.IDENTITY_SERVICE_URL ||
    (process.env.DEPLOY_ENV === "testnet"
      ? "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/"
      : "https://identity.ic0.app/"),
  OWN_CANISTER_ID: process.env.OWN_CANISTER_ID,
  HOST: process.env.HOST || "",
  DEPLOY_ENV: process.env.DEPLOY_ENV,
  // When developing with live reload in svelte, redirecting to flutter is
  // not desirable.  The default should match production:
  // - false while svelte is inactive
  // - true while flutter is being replaced by svelte
  // - false after flutter has been replaced, but before all scaffolding has been removed
  // - the flag may then be removed.
  REDIRECT_TO_LEGACY: ["true", "1"].includes(process.env.REDIRECT_TO_LEGACY)
    ? true
    : ["false", "0"].includes(process.env.REDIRECT_TO_LEGACY)
    ? false
    : true, // default
};
