import type { Account } from "$lib/types/account";
import type { UniverseCanisterId } from "$lib/types/universe";

export type AccountsModalType = "nns-receive" | "icrc-receive" | "buy-icp";

export interface AccountsModalData {
  account: Account | undefined;
  reload: (() => Promise<void>) | undefined;
  canSelectAccount: boolean;
}

export interface AccountsReceiveModalData extends AccountsModalData {
  universeId: UniverseCanisterId | undefined;
  tokenSymbol: string | undefined;
  logo: string;
}

export interface AccountsModal<T> {
  type: AccountsModalType;
  data: T;
}
