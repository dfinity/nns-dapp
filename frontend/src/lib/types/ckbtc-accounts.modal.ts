import type { Account } from "$lib/types/account";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterId } from "$lib/types/universe";

export type CkBTCWalletModalType = "ckbtc-receive" | "ckbtc-transaction" | "ckbtc-wallet-transaction";

export interface CkBTCWalletModalData {
  account: Account | undefined;
  universeId: UniverseCanisterId;
  canisters: CkBTCAdditionalCanisters;
}

export type CkBTCWalletTransactionModalData = {
  reloadAccountFromStore: () => void;
} & Required<CkBTCWalletModalData>;

export interface CkBTCReceiveModalData
  extends CkBTCWalletModalData {
  // @deprecated remove when ckBTC with minter is live
  displayBtcAddress: boolean;
  btcAddress: string;
  reloadAccount: () => Promise<void>;
}

export interface CkBTCWalletModal {
  type: CkBTCWalletModalType;
  data: CkBTCReceiveModalData | CkBTCWalletTransactionModalData;
}
