import type { Filter } from "$lib/types/filters";
import type { Principal } from "@dfinity/principal";
import type {
  SnsNervousSystemFunction,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { writable } from "svelte/store";

export interface ProjectFiltersStoreData {
  topics: Filter<SnsNervousSystemFunction>[];
  rewardStatus: Filter<SnsProposalRewardStatus>[];
  decisionStatus: Filter<SnsProposalDecisionStatus>[];
}

interface SnsFiltersStoreData {
  [rootCanisterId: string]: ProjectFiltersStoreData;
}

/**
 * A store that contains the filters of the SNS proposals for each project.
 */
export const initSnsFiltersStore = () => {
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

    checkDecisionStatus({
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
