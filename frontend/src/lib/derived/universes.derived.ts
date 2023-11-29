import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
import {
  snsProjectsCommittedStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import type { Universe } from "$lib/types/universe";
import { createSnsUniverse } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";
import { icrcTokensUniversesStore } from "./icrc-universes.derived";
import { nnsUniverseStore } from "./nns-universe.derived";

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
    ...(projects.map(({ summary }) => createSnsUniverse(summary)) ?? []),
  ]
);
