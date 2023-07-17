import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { IcpAccountIdentifier } from "$lib/types/account";
import type { BtcAddressText } from "$lib/types/bitcoin";
import type { IcrcBlockIndex } from "@dfinity/ledger";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

type BitcoinAddressData = Record<IcpAccountIdentifier, BtcAddressText>;

export interface BitcoinAddressStore extends Readable<BitcoinAddressData> {
  set: (params: {
    identifier: IcpAccountIdentifier;
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
      identifier: IcpAccountIdentifier;
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

export interface BitcoinConvertBlockIndexesStore
  extends Readable<IcrcBlockIndex[]> {
  addBlockIndex: (blockIndex: IcrcBlockIndex) => void;
  removeBlockIndex: (blockIndex: IcrcBlockIndex) => void;
  reset: () => void;
}

const initBitcoinConvertBlockIndexes = (): BitcoinConvertBlockIndexesStore => {
  const { subscribe, update, set } = writableStored<IcrcBlockIndex[]>({
    key: StoreLocalStorageKey.BitcoinConvertBlockIndexes,
    defaultValue: [],
  });

  return {
    subscribe,

    addBlockIndex: (blockIndex: IcrcBlockIndex) =>
      update((blockIndexes) =>
        Array.from(new Set([...blockIndexes, blockIndex]))
      ),

    removeBlockIndex: (blockIndex: IcrcBlockIndex) =>
      update((blockIndexes) =>
        blockIndexes.filter((block) => block !== blockIndex)
      ),

    reset: () => set([]),
  };
};

export const bitcoinAddressStore = initBitcoinAddressStore();
export const bitcoinConvertBlockIndexes = initBitcoinConvertBlockIndexes();
