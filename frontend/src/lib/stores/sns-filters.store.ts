import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type {
  Filter,
  SnsProposalTopicFilterId,
  SnsProposalTypeFilterId,
} from "$lib/types/filters";
import { mapEntries } from "$lib/utils/utils";
import type { CanisterIdString } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsProposalDecisionStatus } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";

export interface ProjectFiltersStoreData {
  types: Filter<SnsProposalTypeFilterId>[];
  decisionStatus: Filter<SnsProposalDecisionStatus>[];
  topics: Filter<SnsProposalTopicFilterId>[];
}

export interface SnsFiltersStoreData {
  [rootCanisterId: CanisterIdString]: ProjectFiltersStoreData;
}

export interface SnsFiltersStore extends Readable<SnsFiltersStoreData> {
  setTypes: (data: {
    rootCanisterId: Principal;
    types: Filter<SnsProposalTypeFilterId>[];
  }) => void;
  setCheckTypes: (data: {
    rootCanisterId: Principal;
    checkedTypes: SnsProposalTypeFilterId[];
  }) => void;
  setDecisionStatus: (data: {
    rootCanisterId: Principal;
    decisionStatus: Filter<SnsProposalDecisionStatus>[];
  }) => void;
  setCheckDecisionStatus: (data: {
    rootCanisterId: Principal;
    checkedDecisionStatus: SnsProposalDecisionStatus[];
  }) => void;
  setTopics: (data: {
    rootCanisterId: Principal;
    topics: Filter<SnsProposalTopicFilterId>[];
  }) => void;
  setCheckTopics: (data: {
    rootCanisterId: Principal;
    checkedTopics: SnsProposalTopicFilterId[];
  }) => void;
  reset: () => void;
}

const defaultProjectData: ProjectFiltersStoreData = {
  types: [],
  decisionStatus: [],
  topics: [],
};

/**
 * A store that contains the filters of the SNS proposals for each project.
 */
export const initSnsFiltersStore = (): SnsFiltersStore => {
  const { subscribe, set, update } = writableStored<SnsFiltersStoreData>({
    key: StoreLocalStorageKey.SnsProposalFilters,
    defaultValue: {},
    // to reset the state w/o "types"
    version: 1,
  });

  return {
    subscribe,

    setTypes({
      rootCanisterId,
      types,
    }: {
      rootCanisterId: Principal;
      types: Filter<SnsProposalTypeFilterId>[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            types,
          },
        };
      });
    },

    setCheckTypes({
      rootCanisterId,
      checkedTypes,
    }: {
      rootCanisterId: Principal;
      checkedTypes: SnsProposalTypeFilterId[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            types: projectFilters.types.map((type) => ({
              ...type,
              checked: checkedTypes.includes(type.value),
            })),
          },
        };
      });
    },

    setTopics({
      rootCanisterId,
      topics,
    }: {
      rootCanisterId: Principal;
      topics: Filter<SnsProposalTopicFilterId>[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            topics,
          },
        };
      });
    },

    setCheckTopics({
      rootCanisterId,
      checkedTopics,
    }: {
      rootCanisterId: Principal;
      checkedTopics: SnsProposalTopicFilterId[];
    }) {
      update((currentState: SnsFiltersStoreData) => {
        const projectFilters =
          currentState[rootCanisterId.toText()] || defaultProjectData;

        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectFilters,
            topics: projectFilters.topics.map((topic) => ({
              ...topic,
              checked: checkedTopics.includes(topic.value),
            })),
          },
        };
      });
    },

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

    reset: () => set({}),
  };
};

export const snsFiltersStore = initSnsFiltersStore();

export const snsSelectedFiltersStore = derived<
  Readable<SnsFiltersStoreData>,
  SnsFiltersStoreData
>(snsFiltersStore, ($snsFilters) =>
  mapEntries({
    obj: $snsFilters,
    mapFn: ([rootCanisterIdText, filters]) => [
      rootCanisterIdText,
      {
        types: filters.types.filter(({ checked }) => checked),
        decisionStatus: filters.decisionStatus.filter(({ checked }) => checked),
        // TODO: Remove conditional check of topics?.filter after some time. Backwards compatibility with existing filters stored in localStorage
        topics: filters.topics?.filter(({ checked }) => checked) ?? [],
      },
    ],
  })
);
