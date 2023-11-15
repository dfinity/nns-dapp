import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
import {
  snsProjectsCommittedStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import type { Universe } from "$lib/types/universe";
import { createUniverse } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";
import { nnsUniverseStore } from "./nns-universe.derived";

export const universesStore = derived<
  [Readable<Universe>, Readable<SnsFullProject[]>, Readable<Universe[]>],
  Universe[]
>(
  [nnsUniverseStore, snsProjectsCommittedStore, ckBTCUniversesStore],
  ([nnsUniverse, projects, ckBTCUniverses]: [
    Universe,
    SnsFullProject[],
    Universe[],
  ]) => [
    nnsUniverse,
    ...ckBTCUniverses,
    ...(projects.map(({ summary }) => createUniverse(summary)) ?? []),
  ]
);
