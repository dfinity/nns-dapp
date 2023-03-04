import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import {
  ENABLE_CKBTC,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const CKBTC_UNIVERSE: Universe = {
  canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
};

export const CKTESTBTC_UNIVERSE: Universe = {
  canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
};

export const ckBTCUniversesStore = derived<
  [Readable<boolean>, Readable<boolean>],
  Universe[]
>(
  [ENABLE_CKBTC, ENABLE_CKTESTBTC],
  ([$ENABLE_CKBTC, $ENABLE_CKTESTBTC]: [boolean, boolean]) => [
    ...($ENABLE_CKBTC ? [CKBTC_UNIVERSE] : []),
    ...($ENABLE_CKTESTBTC ? [CKTESTBTC_UNIVERSE] : []),
  ]
);
