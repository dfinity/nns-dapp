import { getEnvVars } from "$lib/utils/env-vars.utils";
import { Principal } from "@dfinity/principal";

const envVars = getEnvVars();

// TODO: Use mainnet canister IDs when available. These are sepolia canister IDs.
const MAINNET_CKUSDC_LEDGER_CANISTER_ID = "yfumr-cyaaa-aaaar-qaela-cai";
const MAINNET_CKUSDC_INDEX_CANISTER_ID = "ycvkf-paaaa-aaaar-qaelq-cai";

export const CKUSDCSEPOLIA_LEDGER_CANISTER_ID = Principal.fromText(
  "yfumr-cyaaa-aaaar-qaela-cai"
);

export const CKUSDCSEPOLIA_INDEX_CANISTER_ID = Principal.fromText(
  "ycvkf-paaaa-aaaar-qaelq-cai"
);

export const CKUSDC_LEDGER_CANISTER_ID = Principal.fromText(
  envVars.ckusdcLedgerCanisterId ?? MAINNET_CKUSDC_LEDGER_CANISTER_ID
);
export const CKUSDC_INDEX_CANISTER_ID = Principal.fromText(
  envVars.ckusdcIndexCanisterId ?? MAINNET_CKUSDC_INDEX_CANISTER_ID
);

// Universes: the universe === the ledger canister ID
export const CKUSDC_UNIVERSE_CANISTER_ID = CKUSDC_LEDGER_CANISTER_ID;
export const CKUSDCSEPOLIA_UNIVERSE_CANISTER_ID =
  CKUSDCSEPOLIA_LEDGER_CANISTER_ID;
