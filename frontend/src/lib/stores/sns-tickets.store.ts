import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import { writable } from "svelte/store";
import { removeKeys } from "../utils/utils";

export interface SnsTicketsStoreEntry {
  /**
   * undefined: not set
   * null: no ticket
   */
  ticket: Ticket | undefined | null;
}

export interface SnsTicketsStore {
  // Root canister id is the key to identify the parameters for a specific project.
  [rootCanisterId: string]: SnsTicketsStoreEntry | undefined;
}

const initSnsTicketsStore = () => {
  const { subscribe, update, set } = writable<SnsTicketsStore>({});

  return {
    subscribe,

    /**
     * @param rootCanisterId
     * @param {Ticket | null | undefined} ticket undefined - not set; null - no ticket.
     */
    setTicket({
      rootCanisterId,
      ticket,
    }: {
      rootCanisterId: Principal;
      ticket: Ticket;
    }) {
      update((currentState: SnsTicketsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          ticket,
        },
      }));
    },

    /**
     * Mark that there is currently no open ticket in processing for the rootCanisterIndex
     * @param rootCanisterId
     */
    setNoTicket(rootCanisterId: Principal) {
      update((currentState: SnsTicketsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          ticket: null,
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

// TODO(sale): rename to openTickets
export const snsTicketsStore = initSnsTicketsStore();
