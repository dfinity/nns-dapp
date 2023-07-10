import type { Account } from "$lib/types/account";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterId } from "$lib/types/universe";

export type CkBTCWalletModalType = "ckbtc-receive" | "ckbtc-transaction";

export interface CkBTCWalletModalData {
  account: Account | undefined;
  universeId: UniverseCanisterId;
  canisters: CkBTCAdditionalCanisters;
}

export type CkBTCTransactionModalData = {
  reloadAccountFromStore: (() => void) | undefined;
  loadTransactions: boolean;
} & CkBTCWalletModalData;

export type CkBTCReceiveModalData = {
  reload: (() => Promise<void>) | undefined;
  canSelectAccount: boolean;
} & Omit<CkBTCWalletModalData, "account"> &
  Partial<Pick<CkBTCWalletModalData, "account">>;

export interface CkBTCWalletModal {
  type: CkBTCWalletModalType;
  data: CkBTCReceiveModalData | CkBTCTransactionModalData;
}
