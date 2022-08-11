import { existsSync, readFileSync } from "fs";

/**
 * All environment variables are defined and configured in dfx.json.
 * Upon ./config.sh or build, for a specific DFX_NETWORK, a "deployment-config.json" file will be generated with the configuration of the selected environment.
 * Because the frontend - through Rollup - needs a few more information, we concatenate here these configuration variables with few more information.
 */
const CONFIG_FILE = "../deployment-config.json";

// Edge case: we run the script to create the config file earlier than this file is executed.
if (!existsSync(CONFIG_FILE)) {
  throw new Error(
    "Config file missing from '${CONFIG_FILE}'. Run `DFX_NETWORK=testnet npm run build:config` for local development."
  );
}

const configFromFile = JSON.parse(
  readFileSync(CONFIG_FILE, { encoding: "utf8" })
);

const ROLLUP_WATCH = process.env.ROLLUP_WATCH === "true";

const ENVIRONMENT = ROLLUP_WATCH
  ? "local" // Note: This is also deployed to testnets.
  : process.env.DFX_NETWORK === "testnet"
  ? "testnet"
  : "mainnet";

// agent-js connects per default to mainnet with the anonymous identity
const MAINNET = `https://ic0.app`;

export const envConfig = {
  ENVIRONMENT,
  MAINNET,
  ROLLUP_WATCH,
  ...configFromFile,
};

// Note: This is a useful printout at build time.  Please do not remove.
if (ENVIRONMENT !== "local") {
  console.log(
    JSON.stringify({ svelteEnvironmentVariables: envConfig }, null, 2)
  );
}
