/**
 * As long as we use the Flutter app, we need to handle the configuration with miscellaneous environment variables.
 * In addition, some of these variables have default fallback values according their environment - e.g. testnet or mainnet.
 *
 * That's why we group here the logic and default values to expose a single object - envConfig - that contains the effective configuration.
 *
 * The configuration is use in the rollup build but also in the parser of the static files - e.g. build.index.mjs to output the index.html with a CSP.
 */

import fs from "fs";

/**
 * Configuration is provided in a JSON file.  The JSON file SHOULD exist, if it doesn't it
 * will be created with the mainnet values.  The values in the file MAY then be overridden
 * using environment variables.
 */
const CONFIG_FILE = "../../deployment-config.json";
// Edge case: we run the script to create the config file earlier than this file is executed.
if (!fs.existsSync(CONFIG_FILE)) {
  throw new Error(
    "Config file missing from '${CONFIG_FILE}'. Run `DEPLOY_ENV=testnet npm run build:config` for local development."
  );
}
const configFromFile = JSON.parse(
  fs.readFileSync(CONFIG_FILE, { encoding: "utf8" })
);

/**
 * Returns the given environment variable, if defined and non-empty, else throws an error.
 */
function getRequiredEnvVar(key) {
  let value = process.env[key];
  if (undefined === value || value === "") {
    value = configFromFile[key];
  }
  if (undefined === value || value === "") {
    throw new Error(`Environment variable '${key}' is undefined.`);
  }
  return value;
}

const IDENTITY_SERVICE_URL = getRequiredEnvVar("IDENTITY_SERVICE_URL");

const ROLLUP_WATCH = process.env.ROLLUP_WATCH === "true";

const ENVIRONMENT = ROLLUP_WATCH
  ? "local" // Note: This is also deployed to testnets.
  : process.env.DEPLOY_ENV === "testnet"
  ? "testnet"
  : "mainnet";

// agent-js connects per default to mainnet with the anonymous identity
const MAINNET = `https://ic0.app`;

// The host that nns-js connects to
const HOST = getRequiredEnvVar("HOST");

// Canister Ids for testnet and mainnet
const GOVERNANCE_CANISTER_ID = getRequiredEnvVar("GOVERNANCE_CANISTER_ID");
const LEDGER_CANISTER_ID = getRequiredEnvVar("LEDGER_CANISTER_ID");
const CYCLES_MINTING_CANISTER_ID = getRequiredEnvVar(
  "CYCLES_MINTING_CANISTER_ID"
);
const OWN_CANISTER_ID = getRequiredEnvVar("OWN_CANISTER_ID");

// Canister URLs for the content security policy
const GOVERNANCE_CANISTER_URL = getRequiredEnvVar("GOVERNANCE_CANISTER_URL");
const LEDGER_CANISTER_URL = getRequiredEnvVar("LEDGER_CANISTER_URL");
const OWN_CANISTER_URL = getRequiredEnvVar("OWN_CANISTER_URL");

// Configuration
// ... Redirects between the svelte and now deleted frontends
const REDIRECT_TO_LEGACY = getRequiredEnvVar("REDIRECT_TO_LEGACY");
// ... The testnet name
const DEPLOY_ENV = getRequiredEnvVar("DEPLOY_ENV");
// ... Whether to get the root key
const FETCH_ROOT_KEY = getRequiredEnvVar("FETCH_ROOT_KEY");

export const envConfig = {
  ENVIRONMENT,
  DEPLOY_ENV,
  FETCH_ROOT_KEY,
  REDIRECT_TO_LEGACY,
  MAINNET,
  HOST,
  OWN_CANISTER_ID,
  OWN_CANISTER_URL,
  IDENTITY_SERVICE_URL,
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
  CYCLES_MINTING_CANISTER_ID,
  GOVERNANCE_CANISTER_URL,
  LEDGER_CANISTER_URL,
  ROLLUP_WATCH,
};

// Note: This is a useful printout at build time.  Please do not remove.
if (ENVIRONMENT !== "local") {
  console.log(
    JSON.stringify({ svelteEnvironmentVariables: envConfig }, null, 2)
  );
}
