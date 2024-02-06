import type { Principal } from "@dfinity/principal";
import type { Account } from "./account";
import type { IcrcTokenMetadata } from "./icrc";

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
