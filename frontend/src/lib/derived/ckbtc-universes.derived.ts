import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import {
  ENABLE_CKBTC_LEDGER,
  ENABLE_CKBTC_MINTER,
} from "$lib/stores/feature-flags.store";
import type { Universe, UniverseCanisterId } from "$lib/types/universe";
import { isUniverseCkBTC } from "$lib/utils/universe.utils";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

const CKBTC_UNIVERSE: Universe = {
  canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
};

const CKTESTBTC_UNIVERSE: Universe = {
  canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
};

export const ckBTCUniversesStore = derived<
  [Readable<boolean>, Readable<boolean>],
  Universe[]
>(
  [ENABLE_CKBTC_LEDGER, ENABLE_CKBTC_MINTER],
  ([$ENABLE_CKBTC_LEDGER, $ENABLE_CKBTC_MINTER]: [boolean, boolean]) => [
    ...($ENABLE_CKBTC_LEDGER ? [CKBTC_UNIVERSE] : []),
    ...($ENABLE_CKBTC_MINTER ? [CKTESTBTC_UNIVERSE] : []),
  ]
);

export const selectedCkBTCUniverseIdStore = derived<
  Readable<UniverseCanisterId>,
  UniverseCanisterId | undefined
>(selectedUniverseIdStore, ($selectedUniverseIdStore: Principal) =>
  isUniverseCkBTC($selectedUniverseIdStore)
    ? $selectedUniverseIdStore
    : undefined
);
