import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import type { PendingUtxo } from "@dfinity/ckbtc";
import { writable, type Readable } from "svelte/store";

type CkbtcPendingUtxosStoreData = Record<UniverseCanisterIdText, PendingUtxo[]>;

export interface CkbtcPendingUtxosStore
  extends Readable<CkbtcPendingUtxosStoreData> {
  setUtxos: (params: {
    universeId: UniverseCanisterId;
    utxos: PendingUtxo[];
  }) => void;
  reset: () => void;
}

/**
 * Intended to hold incoming BTC blockchain UTXOs that have at least 1
 * confirmation but not the required number of confirmations to be credited by
 * the ckBTC minter.
 */
const initCkbtcPendingUtxosStore = (): CkbtcPendingUtxosStore => {
  const initialUtxos: CkbtcPendingUtxosStoreData = {};

  const { subscribe, update, set } =
    writable<CkbtcPendingUtxosStoreData>(initialUtxos);

  return {
    subscribe,

    setUtxos: ({
      universeId,
      utxos,
    }: {
      universeId: UniverseCanisterId;
      utxos: PendingUtxo[];
    }) => {
      utxos = [...utxos];
      utxos.sort((a, b) => a.confirmations - b.confirmations);
      update((currentState: CkbtcPendingUtxosStoreData) => ({
        ...currentState,
        [universeId.toText()]: utxos,
      }));
    },

    reset: () => set(initialUtxos),
  };
};

export const ckbtcPendingUtxosStore = initCkbtcPendingUtxosStore();
