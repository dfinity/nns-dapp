import { getEnvVars } from "$lib/utils/env-vars.utils";
import { Principal } from "@dfinity/principal";

const envVars = getEnvVars();

// TODO: Fallback to ckETH canister IDs on mainnet.
const MAINNET_CKETH_LEDGER_CANISTER_ID = "ss2fx-dyaaa-aaaar-qacoq-cai";
const MAINNET_CKETH_INDEX_CANISTER_ID = "s3zol-vqaaa-aaaar-qacpa-cai";

export const CKETHSEPOLIA_LEDGER_CANISTER_ID = Principal.fromText(
  "apia6-jaaaa-aaaar-qabma-cai"
);

export const CKETHSEPOLIA_INDEX_CANISTER_ID = Principal.fromText(
  "sh5u2-cqaaa-aaaar-qacna-cai"
);

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
