import { getEnvVars } from "$lib/utils/env-vars.utils";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";

const envVars = getEnvVars();

export const OWN_CANISTER_ID_TEXT = envVars?.ownCanisterId ?? "";
export const OWN_CANISTER_ID = Principal.fromText(OWN_CANISTER_ID_TEXT);
export const LEDGER_CANISTER_ID = Principal.fromText(envVars.ledgerCanisterId);
export const INDEX_CANISTER_ID = Principal.fromText(envVars.indexCanisterId);
export const GOVERNANCE_CANISTER_ID = Principal.fromText(
  envVars.governanceCanisterId
);
export const CYCLES_MINTING_CANISTER_ID = Principal.fromText(
  envVars.cyclesMintingCanisterId
);
export const WASM_CANISTER_ID = envVars.wasmCanisterId;

export const TVL_CANISTER_ID: Principal | undefined = nonNullish(
  envVars?.tvlCanisterId
)
  ? Principal.fromText(envVars?.tvlCanisterId)
  : undefined;

// This project has been abandoned https://dfinity.slack.com/archives/C039M7YS6F6/p1733302975333649
export const CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID =
  "ibahq-taaaa-aaaaq-aadna-cai";
