import type { RootCanisterIdText } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface SnsTicketsStoreEntry {
  /**
   * undefined: not set
   * null: no ticket
   */
  ticket: Ticket | undefined | null;
  keepPolling: boolean;
}

export type SnsTicketsStoreData = Record<
  RootCanisterIdText,
  SnsTicketsStoreEntry | undefined
>;

export interface SnsTicketsStore extends Readable<SnsTicketsStoreData> {
  setTicket: (data: {
    rootCanisterId: Principal;
    ticket: Ticket | undefined | null;
    keepPolling?: boolean;
  }) => void;
  enablePolling: (rootCanisterId: Principal) => void;
  disablePolling: (rootCanisterId: Principal) => void;
  setNoTicket: (rootCanisterId: Principal) => void;
  reset: () => void;
}

const initSnsTicketsStore = (): SnsTicketsStore => {
  const { subscribe, update, set } = writable<SnsTicketsStoreData>({});

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
      update((currentState: SnsTicketsStoreData) => ({
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
      update((currentState: SnsTicketsStoreData) => ({
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
      update((currentState: SnsTicketsStoreData) => ({
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
      update((currentState: SnsTicketsStoreData) => ({
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

export const snsTicketsStore = initSnsTicketsStore();
