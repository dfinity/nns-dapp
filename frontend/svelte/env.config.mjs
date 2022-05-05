/**
 * As long as we use the Flutter app, we need to handle the configuration with miscellaneous environment variables.
 * In addition, some of these variables have default fallback values according their environment - e.g. testnet or mainnet.
 *
 * That's why we group here the logic and default values to expose a single object - envConfig - that contains the effective configuration.
 *
 * The configuration is use in the rollup build but also in the parser of the static files - e.g. build.index.mjs to output the index.html with a CSP.
 */

const ROLLUP_WATCH = process.env.ROLLUP_WATCH === "true";

const ENVIRONMENT = ROLLUP_WATCH
  ? "local" // Note: This is also deployed to testnets.
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
  (development
    ? `https://qjdve-lqaaa-aaaaa-aaaeq-cai.${domainTestnet}/`
    : "https://identity.ic0.app/");

// The host that nns-js connects to
const HOST =
  process.env.HOST || (development ? `https://${domainTestnet}/` : MAINNET);

// Canister Ids for testnet and mainnet
const GOVERNANCE_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
// Testnet canister id
// TODO: Move to index.html L2-265
const OWN_CANISTER_ID =
  process.env.OWN_CANISTER_ID ||
  (development ? "qaa6y-5yaaa-aaaaa-aaafa-cai" : "qoctq-giaaa-aaaaa-aaaea-cai");

const GOVERNANCE_CANISTER_URL = `https://${GOVERNANCE_CANISTER_ID}${domain}/`;
const LEDGER_CANISTER_URL = `https://${LEDGER_CANISTER_ID}${domain}/`;
const OWN_CANISTER_URL = `https://${OWN_CANISTER_ID}${domain}/`;

// For values, see the [README](../../README.md).
// The default should match production.  Except during local development.
const REDIRECT_TO_LEGACY =
  process.env.REDIRECT_TO_LEGACY ||
  (ENVIRONMENT === "local" ? "svelte" : "prod");

export const envConfig = {
  ENVIRONMENT,
  DEPLOY_ENV: process.env.DEPLOY_ENV || (development ? "testnet" : "mainnet"),
  FETCH_ROOT_KEY: development,
  REDIRECT_TO_LEGACY,
  MAINNET,
  HOST,
  OWN_CANISTER_ID,
  OWN_CANISTER_URL,
  IDENTITY_SERVICE_URL,
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
  GOVERNANCE_CANISTER_URL,
  LEDGER_CANISTER_URL,
  ROLLUP_WATCH,
};

// Note: This is a useful printout at build time.  Please do not remove.
if (ENVIRONMENT !== "local") {
  console.log(JSON.stringify({ svelteEnvironmentVariables: envConfig }, null, 2));
}
