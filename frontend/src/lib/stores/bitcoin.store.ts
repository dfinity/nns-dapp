import type { BtcAddressText } from "$lib/types/bitcoin";
import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

type BitcoinAddressData = Record<IcrcAccountIdentifierText, BtcAddressText>;

export interface BitcoinAddressStore extends Readable<BitcoinAddressData> {
  set: (params: {
    identifier: IcrcAccountIdentifierText;
    btcAddress: BtcAddressText;
  }) => void;
  reset: () => void;
}

/**
 * A store that holds in memory the BTC addresses NNS-dapp fetched from the backend to improve the user experience as the backend provides the static information through update calls.
 */
export const initBitcoinAddressStore = (): BitcoinAddressStore => {
  const initialBtcAddresses: BitcoinAddressData = {};

  const { subscribe, update, set } =
    writable<BitcoinAddressData>(initialBtcAddresses);

  return {
    subscribe,

    set: ({
      identifier,
      btcAddress,
    }: {
      identifier: IcrcAccountIdentifierText;
      btcAddress: BtcAddressText;
    }) => {
      update((currentState: BitcoinAddressData) => ({
        ...currentState,
        [identifier]: btcAddress,
      }));
    },

    // For test purpose
    reset: () => set({}),
  };
};

export const bitcoinAddressStore = initBitcoinAddressStore();
