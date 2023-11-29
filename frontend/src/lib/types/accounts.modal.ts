import type { Account } from "$lib/types/account";
import type { UniverseCanisterId } from "$lib/types/universe";

export type AccountsModalType = "nns-receive" | "icrc-receive" | "buy-icp";

export interface AccountsModal {
  type: AccountsModalType;
}

export interface AccountsReceiveModalData {
  account: Account | undefined;
  reload: (() => Promise<void>) | undefined;
  canSelectAccount: boolean;
  universeId: UniverseCanisterId;
  tokenSymbol: string | undefined;
  logo: string;
}

export interface AccountsModal {
  type: AccountsModalType;
  data: AccountsReceiveModalData;
}
