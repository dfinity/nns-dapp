import type { RootCanisterIdText } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import type { SnsSwapTicket } from "@dfinity/sns";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface SnsTicketsStoreEntry {
  /**
   * undefined: not initialized yet
   * null: no ticket available
   */
  ticket: SnsSwapTicket | undefined | null;
}

export type SnsTicketsStoreData = Record<
  RootCanisterIdText,
  SnsTicketsStoreEntry | undefined
>;

export interface SnsTicketsStore extends Readable<SnsTicketsStoreData> {
  setTicket: (data: {
    rootCanisterId: Principal;
    ticket: SnsSwapTicket | undefined | null;
  }) => void;
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
    }: {
      rootCanisterId: Principal;
      ticket: SnsSwapTicket | undefined | null;
    }) {
      update((currentState: SnsTicketsStoreData) => ({
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
      update((currentState: SnsTicketsStoreData) => ({
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
  };
};

export const snsTicketsStore = initSnsTicketsStore();
