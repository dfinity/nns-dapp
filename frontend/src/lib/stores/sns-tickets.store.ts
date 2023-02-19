import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import { writable } from "svelte/store";

export interface SnsTicketsStoreEntry {
  ticket: Ticket | undefined;
  error?: boolean | undefined;
}

export interface SnsTicketsStore {
  // Root canister id is the key to identify the parameters for a specific project.
  [rootCanisterId: string]: SnsTicketsStoreEntry;
}

const initSnsTicketsStore = () => {
  const { subscribe, update, set } = writable<SnsTicketsStore>({});

  return {
    subscribe,

    setTicket({
      rootCanisterId,
      ticket,
    }: {
      rootCanisterId: Principal;
      ticket: Ticket | undefined;
    }) {
      update((currentState: SnsTicketsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          ticket,
        },
      }));
    },

    // Used in tests
    reset() {
      set({});
    },

    removeTicket(rootCanisterId: Principal) {
      update((currentState: SnsTicketsStore) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },
  };
};

export const snsTicketsStore = initSnsTicketsStore();
