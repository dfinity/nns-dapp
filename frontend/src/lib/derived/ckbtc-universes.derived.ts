import { ENABLE_CKTESTBTC } from "$lib/stores/feature-flags.store";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";
import { ckBTCUniverseStore } from "./ckbtc-universe.derived";
import { ckTESTBTCUniverseStore } from "./cktestbtc-universe.derived";

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
