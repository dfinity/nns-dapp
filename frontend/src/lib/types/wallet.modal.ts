import type { Account } from "$lib/types/account";

// Nns
export type WalletModalType = "rename" | "hw-list-neurons";

export interface WalletModal {
  type: WalletModalType;
}

// CkBTC
export type CkBTCWalletModalType = "ckbtc-receive";

export interface CkBTCWalletModalData {
  btcAddress: string;
  account: Account;
}

export interface CkBTCWalletModal {
  type: CkBTCWalletModalType;
  data: CkBTCWalletModalData;
}
