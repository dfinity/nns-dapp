import { getEnvVars } from "$lib/utils/env-vars.utils";
import { Principal } from "@dfinity/principal";

const envVars = getEnvVars();

// TODO: Fallback to CKETH canister IDs on mainnet. These are CKBTC canister IDs.
const MAINNET_CKETH_LEDGER_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";
const MAINNET_CKETH_INDEX_CANISTER_ID = "n5wcd-faaaa-aaaar-qaaea-cai";

// TODO: Add ckETHTEST canister IDs on env vars https://dfinity.atlassian.net/browse/GIX-2137
export const CKETHSEPOLIA_LEDGER_CANISTER_ID = Principal.fromText(
  "mc6ru-gyaaa-aaaar-qaaaq-cai"
);

export const CKETHSEPOLIA_INDEX_CANISTER_ID = Principal.fromText(
  "mm444-5iaaa-aaaar-qaabq-cai"
);

// TODO: Add ckETH canister IDs on env vars https://dfinity.atlassian.net/browse/GIX-2137
export const CKETH_LEDGER_CANISTER_ID = Principal.fromText(
  envVars.ckbtcLedgerCanisterId ?? MAINNET_CKETH_LEDGER_CANISTER_ID
);
export const CKETH_INDEX_CANISTER_ID = Principal.fromText(
  envVars.ckbtcIndexCanisterId ?? MAINNET_CKETH_INDEX_CANISTER_ID
);

// Universes: the universe === the ledger canister ID
export const CKETH_UNIVERSE_CANISTER_ID = CKETH_LEDGER_CANISTER_ID;
export const CKETHSEPOLIA_UNIVERSE_CANISTER_ID =
  CKETHSEPOLIA_LEDGER_CANISTER_ID;
