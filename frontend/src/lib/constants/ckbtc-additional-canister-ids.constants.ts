import {
  CKBTC_INDEX_CANISTER_ID,
  CKBTC_MINTER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_INDEX_CANISTER_ID,
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterIdText } from "$lib/types/universe";

export const CKBTC_ADDITIONAL_CANISTERS: Record<
  UniverseCanisterIdText,
  CkBTCAdditionalCanisters
> = {
  [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
    indexCanisterId: CKBTC_INDEX_CANISTER_ID,
    minterCanisterId: CKBTC_MINTER_CANISTER_ID,
  },
  [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: {
    indexCanisterId: CKTESTBTC_INDEX_CANISTER_ID,
    minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
  },
};
