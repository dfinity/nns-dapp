import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import type { Filter } from "$lib/types/filters";
import type { Principal } from "@dfinity/principal";
import type {
  SnsNervousSystemFunction,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";
import { writableStored } from "./writable-stored";

export interface ProjectFiltersStoreData {
  topics: Filter<SnsNervousSystemFunction>[];
  rewardStatus: Filter<SnsProposalRewardStatus>[];
  decisionStatus: Filter<SnsProposalDecisionStatus>[];
}

export interface SnsFiltersStoreData {
  [rootCanisterId: string]: ProjectFiltersStoreData;
}

export interface SnsFiltersStore extends Readable<SnsFiltersStoreData> {
  setDecisionStatus: (data: {
    rootCanisterId: Principal;
    decisionStatus: Filter<SnsProposalDecisionStatus>[];
  }) => void;
  setCheckDecisionStatus: (data: {
    rootCanisterId: Principal;
    checkedDecisionStatus: SnsProposalDecisionStatus[];
  }) => void;
  setRewardStatus: (data: {
    rootCanisterId: Principal;
    rewardStatus: Filter<SnsProposalRewardStatus>[];
  }) => void;
  setCheckRewardStatus: (data: {
    rootCanisterId: Principal;
    checkedRewardStatus: SnsProposalRewardStatus[];
  }) => void;
  reset: () => void;
}

const defaultProjectData: ProjectFiltersStoreData = {
  topics: [],
  rewardStatus: [],
  decisionStatus: [],
};

/**
 * A store that contains the filters of the SNS proposals for each project.
 *
 * TODO: persist to localstorage
 */
export const initSnsFiltersStore = (): SnsFiltersStore => {
  const { subscribe, set, update } = writableStored<SnsFiltersStoreData>({
    key: StoreLocalStorageKey.SnsProposalFilters,
    defaultValue: {},
  });

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
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

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
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

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

    setRewardStatus({
      rootCanisterId,
      rewardStatus,
    }: {
      rootCanisterId: Principal;
      rewardStatus: Filter<SnsProposalRewardStatus>[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            rewardStatus,
          },
        };
      });
    },

    setCheckRewardStatus({
      rootCanisterId,
      checkedRewardStatus,
    }: {
      rootCanisterId: Principal;
      checkedRewardStatus: SnsProposalRewardStatus[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            rewardStatus: projectFilters.rewardStatus.map((status) => ({
              ...status,
              checked: checkedRewardStatus.includes(status.value),
            })),
          },
        };
      });
    },

    reset: () => set({}),
  };
};

export const snsFiltersStore = initSnsFiltersStore();

export const snsSelectedFiltersStore = derived<
  Readable<SnsFiltersStoreData>,
  SnsFiltersStoreData
>(snsFiltersStore, ($snsFilters) =>
  Object.entries($snsFilters).reduce(
    (acc, [rootCanisterIdText, filters]) => ({
      ...acc,
      [rootCanisterIdText]: {
        topics: filters.topics.filter(({ checked }) => checked),
        rewardStatus: filters.rewardStatus.filter(({ checked }) => checked),
        decisionStatus: filters.decisionStatus.filter(({ checked }) => checked),
      },
    }),
    {}
  )
);
