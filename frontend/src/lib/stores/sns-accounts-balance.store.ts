import type { ProjectAccountsBalance } from "$lib/derived/projects-accounts-balance.derived";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { writable, type Readable } from "svelte/store";

type SnsAccountsBalance = ProjectAccountsBalance;

export type SnsAccountsBalanceStoreData = Record<
  RootCanisterIdText,
  SnsAccountsBalance
>;

export interface SnsAccountsBalanceStore
  extends Readable<SnsAccountsBalanceStoreData> {
  setBalance: (params: {
    rootCanisterId: Principal;
    balance: TokenAmount | undefined | null;
    certified: boolean;
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the balance of the Sns accounts of the projects.
 *
 * - setBalance: set the balance for a project (total of the balance of the accounts of a Sns project).
 * - reset: reset the store to an empty state. used for testing purpose.
 */
const initSnsProjectsAccountsBalanceStore = (): SnsAccountsBalanceStore => {
  const initialEmptyStoreData: SnsAccountsBalanceStoreData = {};

  const { subscribe, update, set } = writable<SnsAccountsBalanceStoreData>(
    initialEmptyStoreData
  );

  return {
    subscribe,

    setBalance({
      rootCanisterId,
      balance,
      certified,
    }: {
      rootCanisterId: Principal;
      balance: TokenAmount | undefined | null;
      certified: boolean;
    }) {
      update((currentState: SnsAccountsBalanceStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          balance,
          certified,
        },
      }));
    },

    // Used for testing
    reset() {
      set(initialEmptyStoreData);
    },
  };
};

export const snsAccountsBalanceStore = initSnsProjectsAccountsBalanceStore();
