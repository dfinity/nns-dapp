import {
  CKBTC_UNIVERSE,
  CKTESTBTC_UNIVERSE,
} from "$lib/constants/universes.constants";
import {
  ENABLE_CKBTC,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

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
