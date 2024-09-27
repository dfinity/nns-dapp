import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import type { QueryAndUpdateStrategy } from "$lib/services/utils.services";
import {
  concatenateUniqueProposals,
  excludeProposals,
  replaceAndConcatenateProposals,
  replaceProposals,
} from "$lib/utils/proposals.utils";
import type {
  ProposalId,
  ProposalInfo,
  ProposalStatus,
  Topic,
} from "@dfinity/nns";
import { writable } from "svelte/store";
import { queuedStore } from "./queued-store";
import { writableStored } from "./writable-stored";

export interface ProposalsFiltersStore {
  topics: Topic[];
  status: ProposalStatus[];
}

export interface ProposalsStore {
  proposals: ProposalInfo[];
  certified: boolean | undefined;
}

export interface SingleMutationProposalsStore {
  set: ({
    data,
    certified,
  }: {
    data: ProposalsStore;
    certified: boolean;
  }) => void;

  setProposals: ({
    proposals,
    certified,
  }: {
    proposals: ProposalInfo[];
    certified: boolean;
  }) => void;

  removeProposals: ({
    proposalsToRemove,
    certified,
  }: {
    proposalsToRemove: ProposalInfo[];
    certified: boolean;
  }) => void;

  pushProposals: ({
    proposals,
    certified,
  }: {
    proposals: ProposalInfo[];
    certified: boolean;
  }) => void;

  replaceProposals: ({
    proposals,
    certified,
  }: {
    proposals: ProposalInfo[];
    certified: boolean;
  }) => void;

  cancel: () => void;
}

type ProposalPayload = object | null | undefined;
export type ProposalPayloadsStore = Map<ProposalId, ProposalPayload>;

/**
 * A store that contains the proposals
 *
 * - setProposals: replace the current list of proposals with a new list
 * - pushProposals: append proposals to the current list of proposals. Notably useful when the proposals are fetched in a page that implements an infinite scrolling.
 */
const initProposalsStore = () => {
  const { subscribe, getSingleMutationStore, resetForTesting } =
    queuedStore<ProposalsStore>({
      proposals: [],
      certified: undefined,
    });

  const getSingleMutationProposalsStore = (
    strategy?: QueryAndUpdateStrategy | undefined
  ): SingleMutationProposalsStore => {
    const { set, update, cancel } = getSingleMutationStore(strategy);

    return {
      set,

      setProposals({
        proposals,
        certified,
      }: {
        proposals: ProposalInfo[];
        certified: boolean;
      }) {
        set({
          data: {
            proposals: [...proposals],
            certified,
          },
          certified,
        });
      },

      /**
       * Replace the current list of proposals with a new list without provided proposals to remove untrusted proposals from the store.
       */
      removeProposals({
        proposalsToRemove,
        certified,
      }: {
        proposalsToRemove: ProposalInfo[];
        certified: boolean;
      }) {
        update({
          mutation: ({ proposals, certified }) => ({
            proposals: excludeProposals({
              proposals,
              exclusion: proposalsToRemove,
            }),
            certified,
          }),
          certified,
        });
      },

      pushProposals({
        proposals,
        certified,
      }: {
        proposals: ProposalInfo[];
        certified: boolean;
      }) {
        update({
          mutation: ({ proposals: oldProposals }) => ({
            proposals:
              certified === true
                ? replaceAndConcatenateProposals({
                    oldProposals,
                    newProposals: proposals,
                  })
                : concatenateUniqueProposals({
                    oldProposals,
                    newProposals: proposals,
                  }),
            certified,
          }),
          certified,
        });
      },

      replaceProposals({
        proposals,
        certified: newCertified,
      }: {
        proposals: ProposalInfo[];
        certified: boolean;
      }) {
        update({
          mutation: ({ proposals: oldProposals, certified: oldCertified }) => ({
            proposals: replaceProposals({
              oldProposals,
              newProposals: proposals,
            }),
            // Whether the data in the store is certified.
            certified: oldCertified && newCertified,
          }),
          // Whether the data from this mutation is certified.
          certified: newCertified,
        });
      },

      cancel,
    };
  };

  return {
    subscribe,
    getSingleMutationProposalsStore,
    resetForTesting,

    setProposalsForTesting({
      proposals,
      certified,
    }: {
      proposals: ProposalInfo[];
      certified: boolean;
    }) {
      const mutationStore = getSingleMutationProposalsStore();
      mutationStore.setProposals({ proposals, certified });
    },
  };
};

/**
 * A store that contains the filters that are used to fetch the proposals.
 *
 * The filters are handled in a specific store - i.e. not within the proposals store - because there is no clean way using svelte store to guess what has changed when a value is updated.
 * For example: if a store contains apples and bananas, when a change is applied and the subscribe functions hits, it is not possible to guess if there were new apples or bananas.
 *
 * In the "Proposals" page we have the need to query new proposals when filters changes i.e. trigger a search when the filter changes not when the proposals changes.
 * That's why above limitation leads to a separate store.
 *
 * - filterTopics: set the filter topics (enum Topic)
 * - filterStatus: set the filter for the status of the proposals (enum ProposalStatus)
 */
const initProposalsFiltersStore = () => {
  const { subscribe, update, set } = writableStored<ProposalsFiltersStore>({
    key: StoreLocalStorageKey.ProposalFilters,
    defaultValue: DEFAULT_PROPOSALS_FILTERS,
  });

  return {
    subscribe,

    filterTopics(topics: Topic[]) {
      update((filters: ProposalsFiltersStore) => ({
        ...filters,
        topics,
      }));
    },

    filterStatus(status: ProposalStatus[]) {
      update((filters: ProposalsFiltersStore) => ({
        ...filters,
        status,
      }));
    },

    reset() {
      set(DEFAULT_PROPOSALS_FILTERS);
    },
  };
};

const initProposalPayloadsStore = () => {
  const throwOnSet = (
    map: Map<ProposalId, ProposalPayload>
  ): Map<ProposalId, ProposalPayload> => {
    map.set = () => {
      throw new Error("Please use setPayload");
    };
    return map;
  };

  const { subscribe, update } = writable<ProposalPayloadsStore>(
    throwOnSet(new Map<ProposalId, ProposalPayload>())
  );

  return {
    subscribe,
    setPayload: ({
      proposalId,
      payload,
    }: {
      proposalId: ProposalId;
      payload: ProposalPayload;
    }) =>
      update((stateMap) =>
        throwOnSet(
          // Add new record to current state map and disable native Map.set()
          new Map<ProposalId, ProposalPayload>(stateMap).set(
            proposalId,
            payload
          )
        )
      ),
    reset: () => update(() => throwOnSet(new Map())),
  };
};

export const proposalsStore = initProposalsStore();
export const proposalsFiltersStore = initProposalsFiltersStore();
export const proposalPayloadsStore = initProposalPayloadsStore();
