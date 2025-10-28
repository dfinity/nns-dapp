import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { writable } from "svelte/store";

export interface AddressBookStore {
  namedAddresses: NamedAddress[] | undefined;
  certified: boolean | undefined;
}

/**
 * A store that contains the user's address book (named addresses)
 */
const initAddressBookStore = () => {
  const { subscribe, set } = writable<AddressBookStore>({
    namedAddresses: undefined,
    certified: undefined,
  });

  return {
    subscribe,

    set({
      namedAddresses,
      certified,
    }: {
      namedAddresses: NamedAddress[];
      certified: boolean;
    }) {
      set({
        namedAddresses,
        certified,
      });
    },

    reset() {
      set({
        namedAddresses: undefined,
        certified: undefined,
      });
    },
  };
};

export const addressBookStore = initAddressBookStore();
