import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
import { icrcTokensUniversesStore } from "$lib/derived/icrc-universes.derived";
import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
import {
  snsProjectsCommittedStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import type { Universe } from "$lib/types/universe";
import { createUniverse } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";

export const universesStore = derived<
  [
    Readable<Universe>,
    Readable<SnsFullProject[]>,
    Readable<Universe[]>,
    Readable<Universe[]>,
  ],
  Universe[]
>(
  [
    nnsUniverseStore,
    snsProjectsCommittedStore,
    ckBTCUniversesStore,
    icrcTokensUniversesStore,
  ],
  ([nnsUniverse, projects, ckBTCUniverses, icrcUniverses]: [
    Universe,
    SnsFullProject[],
    Universe[],
    Universe[],
  ]) => [
    nnsUniverse,
    ...ckBTCUniverses,
    ...icrcUniverses,
    ...(projects.map(({ summary }) => createUniverse(summary)) ?? []),
  ]
);
