import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { Principal } from "@dfinity/principal";

// TODO: https://dfinity.atlassian.net/browse/GIX-2150 to be refactored:
// 1. Integrate those types in accounts.modal.ts
// 2. Remove and integrate IcrcTokenAccountsModal into AccountsModal
// 3. Remove usage in Accounts.svelte and Wallet
export type IcrcTokenModalType = "icrc-send";

export type IcrcTokenTransactionModalData = {
  ledgerCanisterId: Principal;
  token: IcrcTokenMetadata;
  loadTransactions: boolean;
  sourceAccount?: Account;
  reloadSourceAccount?: () => Promise<void>;
};

export interface IcrcTokenModalProps {
  type: IcrcTokenModalType;
  data: IcrcTokenTransactionModalData;
}
