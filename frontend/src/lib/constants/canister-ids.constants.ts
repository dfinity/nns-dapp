import { getEnvVars } from "$lib/utils/env-vars.utils";
import { Principal } from "@dfinity/principal";

const envVars = getEnvVars();

export const OWN_CANISTER_ID_TEXT = envVars?.ownCanisterId ?? "";
export const OWN_CANISTER_ID = Principal.fromText(OWN_CANISTER_ID_TEXT);
export const LEDGER_CANISTER_ID = Principal.fromText(envVars.ledgerCanisterId);
export const GOVERNANCE_CANISTER_ID = Principal.fromText(
  envVars.governanceCanisterId
);
export const CYCLES_MINTING_CANISTER_ID = Principal.fromText(
  envVars.cyclesMintingCanisterId
);
export const WASM_CANISTER_ID = envVars.wasmCanisterId;

// TVL Canister ID on mainnet. Use for readonly.
export const TVL_CANISTER_ID = Principal.fromText(
  "ewh3f-3qaaa-aaaap-aazjq-cai"
);
