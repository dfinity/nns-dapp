import { getEnvVars } from "$lib/utils/env.utils";
import { Principal } from "@dfinity/principal";

const envVarsDataset = getEnvVars();

export const OWN_CANISTER_ID_TEXT = envVarsDataset?.ownCanisterId ?? "";
export const OWN_CANISTER_ID = Principal.fromText(OWN_CANISTER_ID_TEXT);
export const LEDGER_CANISTER_ID = Principal.fromText(
  envVarsDataset.ledgerCanisterId
);
export const GOVERNANCE_CANISTER_ID = Principal.fromText(
  envVarsDataset.governanceCaniserId
);
export const CYCLES_MINTING_CANISTER_ID = Principal.fromText(
  envVarsDataset.cyclesMintingCanisterId
);
export const WASM_CANISTER_ID = envVarsDataset.wasmCanisterId;

// TVL Canister ID on mainnet. Use for readonly.
export const TVL_CANISTER_ID = Principal.fromText(
  "ewh3f-3qaaa-aaaap-aazjq-cai"
);
