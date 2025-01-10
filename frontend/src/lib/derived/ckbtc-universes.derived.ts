import { ckBTCUniverseStore } from "$lib/derived/ckbtc-universe.derived";
import { ckTESTBTCUniverseStore } from "$lib/derived/cktestbtc-universe.derived";
import { ENABLE_CKTESTBTC } from "$lib/stores/feature-flags.store";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const ckBTCUniversesStore = derived<
  [Readable<Universe>, Readable<Universe>, Readable<boolean>],
  Universe[]
>(
  [ckBTCUniverseStore, ckTESTBTCUniverseStore, ENABLE_CKTESTBTC],
  ([ckBTCUniverse, ckTESTBTCUniverse, $ENABLE_CKTESTBTC]: [
    Universe,
    Universe,
    boolean,
  ]) => [ckBTCUniverse, ...($ENABLE_CKTESTBTC ? [ckTESTBTCUniverse] : [])]
);
