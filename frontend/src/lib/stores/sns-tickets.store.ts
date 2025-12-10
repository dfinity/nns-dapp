import type { RootCanisterIdText } from "$lib/types/sns";
import type { SnsSwapDid } from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface SnsTicketsStoreEntry {
  /**
   * undefined: not initialized yet
   * null: no ticket available
   */
  ticket: SnsSwapDid.Ticket | undefined | null;
}

export type SnsTicketsStoreData = Record<
  RootCanisterIdText,
  SnsTicketsStoreEntry | undefined
>;

export interface SnsTicketsStore extends Readable<SnsTicketsStoreData> {
  setTicket: (data: {
    rootCanisterId: Principal;
    ticket: SnsSwapDid.Ticket | undefined | null;
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
      ticket: SnsSwapDid.Ticket | undefined | null;
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
