import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { FEATURED_SNS_PROJECTS } from "$lib/constants/sns.constants";
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
import {
  snsProjectsRecordStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
import { universesStore } from "$lib/derived/universes.derived";
import { tickersStore, type TickersStore } from "$lib/stores/tickers.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { TickersStoreData } from "$lib/types/tickers";
import type { Universe } from "$lib/types/universe";
import { compareLaunchpadSnsProjects } from "$lib/utils/launchpad.utils";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
  type Comparator,
} from "$lib/utils/sort.utils";
import { isAllTokensPath, isUniverseCkBTC } from "$lib/utils/universe.utils";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

type UniverseWithSortData = {
  universe: Universe;
  project: SnsFullProject | undefined;
  actionableProposalCount: number;
};

const compareNnsFirst = createDescendingComparator(
  ({ universe: { canisterId } }: UniverseWithSortData) =>
    canisterId === OWN_CANISTER_ID_TEXT
);

const compareFeaturedFirst = createDescendingComparator(
  ({ universe: { canisterId } }: UniverseWithSortData) =>
    FEATURED_SNS_PROJECTS.includes(canisterId)
);

const compareActionableProposalCount = createDescendingComparator(
  ({ actionableProposalCount }: UniverseWithSortData) => actionableProposalCount
);

const compareTitle = createAscendingComparator(
  ({ universe: { title } }: UniverseWithSortData) => title.toLowerCase()
);

const adaptProjectComparator =
  (comparator: Comparator<SnsFullProject>): Comparator<UniverseWithSortData> =>
  (a, b) => {
    if (a.project !== undefined && b.project !== undefined) {
      return comparator(a.project, b.project);
    }
    return 0;
  };

export const selectableUniversesStore = derived<
  [
    Readable<Universe[]>,
    Readable<Page>,
    IcrcCanistersStore,
    Readable<Record<RootCanisterIdText, SnsFullProject>>,
    Readable<Record<RootCanisterIdText, TokenAmountV2>>,
    TickersStore,
    Readable<ActionableProposalCountData>,
  ],
  Universe[]
>(
  [
    universesStore,
    pageStore,
    icrcCanistersStore,
    snsProjectsRecordStore,
    snsTotalSupplyTokenAmountStore,
    tickersStore,
    actionableProposalCountStore,
  ],
  ([
    universes,
    page,
    icrcCanisters,
    projectsRecord,
    totalSupply,
    tickers,
    actionableProposalCounts,
  ]: [
    Universe[],
    Page,
    IcrcCanistersStoreData,
    Record<RootCanisterIdText, SnsFullProject>,
    Record<RootCanisterIdText, TokenAmountV2>,
    TickersStoreData,
    ActionableProposalCountData,
  ]) => {
    const enriched = universes
      .filter(
        ({ canisterId }) =>
          isAllTokensPath(page) ||
          (!isUniverseCkBTC(canisterId) && isNullish(icrcCanisters[canisterId]))
      )
      .map((universe) => ({
        universe,
        project: projectsRecord[universe.canisterId],
        actionableProposalCount:
          actionableProposalCounts[universe.canisterId] ?? 0,
      }));

    const launchpadSorting = adaptProjectComparator(
      compareLaunchpadSnsProjects({
        snsTotalSupplyTokenAmountStore: totalSupply,
        tickersStore: tickers,
      })
    );

    // On non-governance paths (accounts, wallet), sort alphabetically.
    // On governance paths, sort by launchpad criteria with actionable proposals
    // as priority (only has effect on the proposals page where the data is loaded;
    // on other pages all counts are 0 so it falls through to featured/launchpad).
    const sorting = isAllTokensPath(page)
      ? mergeComparators([compareNnsFirst, compareTitle])
      : mergeComparators([
          compareNnsFirst,
          compareActionableProposalCount,
          compareFeaturedFirst,
          launchpadSorting,
          compareTitle,
        ]);

    return enriched.sort(sorting).map(({ universe }) => universe);
  }
);
