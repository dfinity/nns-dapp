import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  actionableProposalCountStore,
  type ActionableProposalCountData,
} from "$lib/derived/actionable-proposals.derived";
import {
  icrcCanistersStore,
  type IcrcCanistersStore,
  type IcrcCanistersStoreData,
} from "$lib/derived/icrc-canisters.derived";
import { pageStore, type Page } from "$lib/derived/page.derived";
import { universesStore } from "$lib/derived/universes.derived";
import type { Universe } from "$lib/types/universe";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
import { isAllTokensPath, isUniverseCkBTC } from "$lib/utils/universe.utils";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

type UniverseWithActionableProposalCount = {
  universe: Universe;
  actionableProposalCount: number;
};

const compareNnsFirst = createDescendingComparator(
  ({ universe: { canisterId } }: UniverseWithActionableProposalCount) =>
    canisterId === OWN_CANISTER_ID_TEXT
);

const compareActionableProposalCount = createDescendingComparator(
  ({ actionableProposalCount }: UniverseWithActionableProposalCount) =>
    actionableProposalCount
);

const compareTitle = createAscendingComparator(
  ({ universe: { title } }: UniverseWithActionableProposalCount) =>
    title.toLowerCase()
);

export const selectableUniversesStore = derived<
  [
    Readable<Universe[]>,
    Readable<Page>,
    IcrcCanistersStore,
    Readable<ActionableProposalCountData>,
  ],
  Universe[]
>(
  [universesStore, pageStore, icrcCanistersStore, actionableProposalCountStore],
  ([universes, page, icrcCanisters, actionableProposalCounts]: [
    Universe[],
    Page,
    IcrcCanistersStoreData,
    ActionableProposalCountData,
  ]) =>
    // Non-governance paths show all universes
    // The rest show all universes except for ckBTC, and ICRC Tokens
    universes
      .filter(
        ({ canisterId }) =>
          isAllTokensPath(page) ||
          (!isUniverseCkBTC(canisterId) && isNullish(icrcCanisters[canisterId]))
      )
      .map((universe) => ({
        universe,
        actionableProposalCount:
          actionableProposalCounts[universe.canisterId] ?? 0,
      }))
      .sort(
        mergeComparators([
          compareNnsFirst,
          compareActionableProposalCount,
          compareTitle,
        ])
      )
      .map(({ universe }) => universe)
);
