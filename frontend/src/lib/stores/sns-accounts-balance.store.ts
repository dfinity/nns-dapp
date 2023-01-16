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
}

const initSnsProjectsAccountsBalanceStore = (): SnsAccountsBalanceStore => {
  const { subscribe, update } = writable<SnsAccountsBalanceWritableStore>({});

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
  };
};

export const snsAccountsBalanceStore = initSnsProjectsAccountsBalanceStore();
