import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import { writable } from "svelte/store";

export interface SnsTicketsStoreEntry {
  /**
   * undefined: not set
   * null: no ticket
   */
  ticket: Ticket | undefined | null;
  keepPolling: boolean;
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
     * @param {Ticket} ticket undefined - not set; null - no ticket.
     */
    setTicket({
      rootCanisterId,
      ticket,
      keepPolling,
    }: {
      rootCanisterId: Principal;
      ticket: Ticket | undefined | null;
      keepPolling?: boolean;
    }) {
      update((currentState: SnsTicketsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          ticket,
          keepPolling: keepPolling || false,
        },
      }));
    },

    /**
     * Enable polling for the ticket
     *
     * @param rootCanisterId
     */
    enablePolling(rootCanisterId: Principal) {
      update((currentState: SnsTicketsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          ticket: currentState[rootCanisterId.toText()]?.ticket,
          keepPolling: true,
        },
      }));
    },

    /**
     * Disable polling for the ticket
     *
     * This is used for testing purposes only at the moment.
     *
     * @param rootCanisterId
     */
    disablePolling(rootCanisterId: Principal) {
      update((currentState: SnsTicketsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          ticket: currentState[rootCanisterId.toText()]?.ticket,
          keepPolling: false,
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
          keepPolling:
            currentState[rootCanisterId.toText()]?.keepPolling ?? false,
        },
      }));
    },

    // Used in tests
    reset() {
      set({});
    },
  };
};

// TODO(sale): rename to openTickets
export const snsTicketsStore = initSnsTicketsStore();
