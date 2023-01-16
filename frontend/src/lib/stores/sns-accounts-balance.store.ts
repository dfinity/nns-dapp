import type { ProjectAccountsBalance } from "$lib/derived/projects-accounts-balance.derived";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { writable, type Readable } from "svelte/store";

type SnsAccountsBalance = ProjectAccountsBalance;

export type SnsAccountsBalanceWritableStore = Record<
  RootCanisterIdText,
  SnsAccountsBalance
>;

export interface SnsAccountsBalanceStore
  extends Readable<SnsAccountsBalanceWritableStore> {
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
  const initialEmptyWritableStore: SnsAccountsBalanceWritableStore = {};

  const { subscribe, update, set } = writable<SnsAccountsBalanceWritableStore>(
    initialEmptyWritableStore
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
      update((currentState: SnsAccountsBalanceWritableStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          balance,
          certified,
        },
      }));
    },

    // Used for testing
    reset() {
      set(initialEmptyWritableStore);
    },
  };
};

export const snsAccountsBalanceStore = initSnsProjectsAccountsBalanceStore();
