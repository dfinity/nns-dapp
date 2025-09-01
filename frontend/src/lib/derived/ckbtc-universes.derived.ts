import { ckBTCUniverseStore } from "$lib/derived/ckbtc-universe.derived";
import { ckTESTBTCUniverseStore } from "$lib/derived/cktestbtc-universe.derived";
import {
  DISABLE_CKTOKENS,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const ckBTCUniversesStore = derived<
  [
    Readable<Universe>,
    Readable<Universe>,
    Readable<boolean>,
    Readable<boolean>,
  ],
  Universe[]
>(
  [
    ckBTCUniverseStore,
    ckTESTBTCUniverseStore,
    ENABLE_CKTESTBTC,
    DISABLE_CKTOKENS,
  ],
  ([ckBTCUniverse, ckTESTBTCUniverse, $ENABLE_CKTESTBTC, $DISABLE_CKTOKENS]: [
    Universe,
    Universe,
    boolean,
    boolean,
  ]) =>
    $DISABLE_CKTOKENS
      ? []
      : [ckBTCUniverse, ...($ENABLE_CKTESTBTC ? [ckTESTBTCUniverse] : [])]
);
