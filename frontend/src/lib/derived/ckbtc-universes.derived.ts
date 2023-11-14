import {
  ENABLE_CKBTC,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";
import { ckBTCUniverseStore } from "./ckbtc-universe.derived";
import { ckTESTBTCUniverseStore } from "./cktestbtc-universe.derived";

export const ckBTCUniversesStore = derived<
  [
    Readable<Universe>,
    Readable<Universe>,
    Readable<boolean>,
    Readable<boolean>,
  ],
  Universe[]
>(
  [ckBTCUniverseStore, ckTESTBTCUniverseStore, ENABLE_CKBTC, ENABLE_CKTESTBTC],
  ([ckBTCUniverse, ckTESTBTCUniverse, $ENABLE_CKBTC, $ENABLE_CKTESTBTC]: [
    Universe,
    Universe,
    boolean,
    boolean,
  ]) => [
    ...($ENABLE_CKBTC ? [ckBTCUniverse] : []),
    ...($ENABLE_CKTESTBTC ? [ckTESTBTCUniverse] : []),
  ]
);
