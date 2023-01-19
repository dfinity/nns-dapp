import type { Filter } from "$lib/types/filters";
import type { Principal } from "@dfinity/principal";
import type {
  SnsNervousSystemFunction,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

export interface ProjectFiltersStoreData {
  topics: Filter<SnsNervousSystemFunction>[];
  rewardStatus: Filter<SnsProposalRewardStatus>[];
  decisionStatus: Filter<SnsProposalDecisionStatus>[];
}

interface SnsFiltersStoreData {
  [rootCanisterId: string]: ProjectFiltersStoreData;
}

interface ProjectFiltersStore extends Readable<SnsFiltersStoreData> {
  setDecisionStatus: (data: {
    rootCanisterId: Principal;
    decisionStatus: Filter<SnsProposalDecisionStatus>[];
  }) => void;
  setCheckDecisionStatus: (data: {
    rootCanisterId: Principal;
    checkedDecisionStatus: SnsProposalDecisionStatus[];
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the filters of the SNS proposals for each project.
 *
 * TODO: persist to localstorage
 */
export const initSnsFiltersStore = (): ProjectFiltersStore => {
  const { subscribe, set, update } = writable<SnsFiltersStoreData>({});

  return {
    subscribe,

    setDecisionStatus({
      rootCanisterId,
      decisionStatus,
    }: {
      rootCanisterId: Principal;
      decisionStatus: Filter<SnsProposalDecisionStatus>[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters = currentState[rootCanisterId.toText()] || {
          topics: [],
          rewardStatus: [],
          decisionStatus: [],
        };

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            decisionStatus,
          },
        };
      });
    },

    setCheckDecisionStatus({
      rootCanisterId,
      checkedDecisionStatus,
    }: {
      rootCanisterId: Principal;
      checkedDecisionStatus: SnsProposalDecisionStatus[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters = currentState[rootCanisterId.toText()] || {
          topics: [],
          rewardStatus: [],
          decisionStatus: [],
        };

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            decisionStatus: projectFilters.decisionStatus.map(
              (decisionStatus) => ({
                ...decisionStatus,
                checked: checkedDecisionStatus.includes(decisionStatus.value),
              })
            ),
          },
        };
      });
    },

    reset: () => set({}),
  };
};

export const snsFiltesStore = initSnsFiltersStore();
