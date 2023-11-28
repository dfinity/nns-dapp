import { getEnvVars } from "$lib/utils/env-vars.utils";
import { Principal } from "@dfinity/principal";

const envVars = getEnvVars();

// TODO: Fallback to ckETH canister IDs on mainnet. These are Sepolia canister IDs.
const MAINNET_CKETH_LEDGER_CANISTER_ID = "apia6-jaaaa-aaaar-qabma-cai";
// TODO: Change to Sepolia index canister
const MAINNET_CKETH_INDEX_CANISTER_ID = "apia6-jaaaa-aaaar-qabma-cai";

// TODO: Add ckETHTEST canister IDs on env vars https://dfinity.atlassian.net/browse/GIX-2137
export const CKETHSEPOLIA_LEDGER_CANISTER_ID = Principal.fromText(
  "apia6-jaaaa-aaaar-qabma-cai"
);

export const CKETHSEPOLIA_INDEX_CANISTER_ID = Principal.fromText(
  "apia6-jaaaa-aaaar-qabma-cai"
);

// TODO: Add ckETH canister IDs on env vars https://dfinity.atlassian.net/browse/GIX-2137
export const CKETH_LEDGER_CANISTER_ID = Principal.fromText(
  envVars.ckethLedgerCanisterId ?? MAINNET_CKETH_LEDGER_CANISTER_ID
);
export const CKETH_INDEX_CANISTER_ID = Principal.fromText(
  envVars.ckethIndexCanisterId ?? MAINNET_CKETH_INDEX_CANISTER_ID
);

// Universes: the universe === the ledger canister ID
export const CKETH_UNIVERSE_CANISTER_ID = CKETH_LEDGER_CANISTER_ID;
export const CKETHSEPOLIA_UNIVERSE_CANISTER_ID =
  CKETHSEPOLIA_LEDGER_CANISTER_ID;
