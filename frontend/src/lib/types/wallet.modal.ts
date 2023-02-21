import type { Account } from "$lib/types/account";
import type { UniverseCanisterId } from "$lib/types/universe";

// Nns
export type WalletModalType = "rename" | "hw-list-neurons";

export interface WalletModal {
  type: WalletModalType;
}

// CkBTC
export type CkBTCWalletModalType = "ckbtc-receive" | "ckbtc-transaction";

export interface CkBTCWalletModalData {
  account: Account;
  universeId: UniverseCanisterId;
}

export interface CkBTCWalletTransactionModalData extends CkBTCWalletModalData {
  reloadAccountFromStore: () => void;
}

export interface CkBTCWalletReceiveModalData extends CkBTCWalletModalData {
  btcAddress: string;
  reloadAccount: () => Promise<void>;
}

export interface CkBTCWalletModal {
  type: CkBTCWalletModalType;
  data: CkBTCWalletReceiveModalData | CkBTCWalletTransactionModalData;
}
