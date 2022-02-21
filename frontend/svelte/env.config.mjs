/**
 * As long as we use the Flutter app, we need to handle the configuration with miscellaneous environment variables.
 * In addition, some of these variables have default fallback values according their environment - e.g. testnet or mainnet.
 *
 * That's why we group here the logic and default values to expose a single object - envConfig - that contains the effective configuration.
 *
 * The configuration is use in the rollup build but also in the parser of the static files - e.g. build.index.mjs to output the index.html with a CSP.
 */

const ENVIRONMENT = process.env.ROLLUP_WATCH
  ? "local"
  : process.env.DEPLOY_ENV === "testnet"
  ? "testnet"
  : "mainnet";

const development = ["local", "testnet"].includes(ENVIRONMENT);

const domainTestnet = "nnsdapp.dfinity.network";
const domainMainnet = "ic0.app";
const domain = development ? domainTestnet : domainMainnet;

// agent-js connects per default to mainnet with the anonymous identity
const MAINNET = `https://${domainMainnet}`;

const IDENTITY_SERVICE_URL =
  process.env.IDENTITY_SERVICE_URL ||
  (process.env.DEPLOY_ENV === "testnet"
    ? `https://qjdve-lqaaa-aaaaa-aaaeq-cai.${domainTestnet}/`
    : "https://identity.ic0.app/");

const HOST =
  process.env.HOST ||
  (process.env.DEPLOY_ENV === "testnet" ? `https://${domainTestnet}/` : "");

const GOVERNANCE_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

const GOVERNANCE_CANISTER_URL = `https://${GOVERNANCE_CANISTER_ID}${domain}/`;
const LEDGER_CANISTER_URL = `https://${LEDGER_CANISTER_ID}${domain}/`;

// When developing with live reload in svelte, redirecting to flutter is
// not desirable.  The default should match production:
// - false while svelte is inactive
// - true while flutter is being replaced by svelte
// - false after flutter has been replaced, but before all scaffolding has been removed
// - the flag may then be removed.
const REDIRECT_TO_LEGACY = ["true", "1"].includes(
  process.env.REDIRECT_TO_LEGACY
)
  ? true
  : ["false", "0"].includes(process.env.REDIRECT_TO_LEGACY)
  ? false
  : true; // default

export const envConfig = {
  ENVIRONMENT,
  DEPLOY_ENV: process.env.DEPLOY_ENV,
  FETCH_ROOT_KEY: development,
  REDIRECT_TO_LEGACY,
  MAINNET,
  HOST,
  OWN_CANISTER_ID: process.env.OWN_CANISTER_ID,
  IDENTITY_SERVICE_URL,
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
  GOVERNANCE_CANISTER_URL,
  LEDGER_CANISTER_URL,
};
