import type { Account } from "$lib/types/account";
import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import { writable, type Readable } from "svelte/store";

export type CkBTCBTCWithdrawalAccount = Omit<
  Account,
  "balance" | "identifier"
> &
  Partial<Pick<Account, "balance" | "identifier">>;

export interface CkBTCBTCWithdrawalAccountData {
  account: CkBTCBTCWithdrawalAccount;
  certified: boolean;
}

type CkBTCBTCWithdrawalAccountStoreData = Record<
  UniverseCanisterIdText,
  CkBTCBTCWithdrawalAccountData
>;

export interface CkBTCBTCWithdrawalAccountsStore
  extends Readable<CkBTCBTCWithdrawalAccountStoreData> {
  set: (params: {
    account: CkBTCBTCWithdrawalAccountData;
    universeId: UniverseCanisterId;
  }) => void;
  reset: () => void;
}

/**
 * ckBTC has the particularity to hold accounts for the users with an ICRC ledger but, also to use a minter to convert BTC to ckBTC back and forth.
 * When a user convert ckBTC to BTC, the user first transfer ckBTC to the ledger with a withdrawal address.
 * These are accounts but not stricto sensu accounts we want to display to the users as any other account (main, sub or hw).
 * In addition, these types of account need more work to be loaded - more update calls.
 * That is why we hold the withdrawal accounts in a separate store and why they can be undefined - undefined representing an account being loaded.
 */
const initCkBTCBTCWithdrawalAccountsStore =
  (): CkBTCBTCWithdrawalAccountsStore => {
    const initialAccounts: CkBTCBTCWithdrawalAccountStoreData = {};

    const { subscribe, update, set } =
      writable<CkBTCBTCWithdrawalAccountStoreData>(initialAccounts);

    return {
      subscribe,

      set: ({
        account,
        universeId,
      }: {
        account: CkBTCBTCWithdrawalAccountData;
        universeId: UniverseCanisterId;
      }) => {
        update((currentState: CkBTCBTCWithdrawalAccountStoreData) => ({
          ...currentState,
          [universeId.toText()]: account,
        }));
      },

      reset: () => set(initialAccounts),
    };
  };

export const ckBTCWithdrawalAccountsStore =
  initCkBTCBTCWithdrawalAccountsStore();
