import type { Account } from "$lib/types/account";
import type { UniverseCanisterId } from "$lib/types/universe";

export type AccountsModalType = "receive";

export interface AccountsModal {
  type: AccountsModalType;
}

export interface AccountsModalData {
  universeId: UniverseCanisterId;
}

export interface AccountsReceiveModalData extends AccountsModalData {
  account: Account | undefined;
  reloadAccount: (() => Promise<void>) | undefined;
  canSelectAccount: boolean;
}

export interface AccountsModal {
  type: AccountsModalType;
  data: AccountsReceiveModalData;
}
