import { Principal } from "@dfinity/principal";
import { notEmptyString } from "@dfinity/utils";

// TODO: environment variables for ckBTC "minter" canister ID
export const CKBTC_MINTER_CANISTER_ID = Principal.fromText(
  "q3fc5-haaaa-aaaaa-aaahq-cai"
);

// We fallback to hardcoded canister IDs because ckBTC is not deployed on every environment at the moment and, we do not want to introduce constants that can be undefined.
// The feature flags should be set accordingly. The feature is active on mainnet, therefore the fallback values are the one to use on mainnet.
const MAINNET_CKBTC_LEDGER_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";
const MAINNET_CKBTC_INDEX_CANISTER_ID = "n5wcd-faaaa-aaaar-qaaea-cai";

const ENV_CKBTC_LEDGER_CANISTER_ID = import.meta.env
  .VITE_CKBTC_LEDGER_CANISTER_ID;
const ENV_CKBTC_INDEX_CANISTER_ID = import.meta.env
  .VITE_CKBTC_INDEX_CANISTER_ID;

export const CKBTC_LEDGER_CANISTER_ID = Principal.fromText(
  notEmptyString(ENV_CKBTC_LEDGER_CANISTER_ID)
    ? ENV_CKBTC_LEDGER_CANISTER_ID
    : MAINNET_CKBTC_LEDGER_CANISTER_ID
);
export const CKBTC_INDEX_CANISTER_ID = Principal.fromText(
  notEmptyString(ENV_CKBTC_INDEX_CANISTER_ID)
    ? ENV_CKBTC_INDEX_CANISTER_ID
    : MAINNET_CKBTC_INDEX_CANISTER_ID
);

// Universes

export const CKBTC_UNIVERSE_CANISTER_ID = CKBTC_LEDGER_CANISTER_ID;
