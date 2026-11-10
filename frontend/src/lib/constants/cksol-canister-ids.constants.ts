import { Principal } from "@icp-sdk/core/principal";

// ckSOL is not deployed on the local and test networks, so there is no
// environment variable override and only the mainnet canister IDs are used.
const MAINNET_CKSOL_LEDGER_CANISTER_ID = "ls5lp-lqaaa-aaaar-qb5oa-cai";
const MAINNET_CKSOL_INDEX_CANISTER_ID = "2ezyf-hqaaa-aaaar-qb6ga-cai";

export const CKSOL_LEDGER_CANISTER_ID = Principal.fromText(
  MAINNET_CKSOL_LEDGER_CANISTER_ID
);
export const CKSOL_INDEX_CANISTER_ID = Principal.fromText(
  MAINNET_CKSOL_INDEX_CANISTER_ID
);

// Universes: the universe === the ledger canister ID
export const CKSOL_UNIVERSE_CANISTER_ID = CKSOL_LEDGER_CANISTER_ID;
