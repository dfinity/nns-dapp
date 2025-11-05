import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { getAddressString } from "$lib/utils/address-book.utils";
import { derived, writable } from "svelte/store";

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

/**
 * A derived store that maps addresses to their labels
 * Returns a Map<address, label>
 */
export const addressToLabelStore = derived(
  addressBookStore,
  ($addressBookStore) => {
    const map = new Map<string, string>();
    const addresses = $addressBookStore.namedAddresses || [];

    for (const namedAddress of addresses) {
      const addressString = getAddressString(namedAddress.address);
      map.set(addressString, namedAddress.name);
    }

    return map;
  }
);
