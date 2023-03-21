import type { Account } from "$lib/types/account";

export type AccountsModalType = "nns-receive" | "sns-receive";

export interface AccountsModal {
  type: AccountsModalType;
}

export interface AccountsReceiveModalData {
  account: Account | undefined;
  reload: (() => Promise<void>) | undefined;
  canSelectAccount: boolean;
}

export interface AccountsModal {
  type: AccountsModalType;
  data: AccountsReceiveModalData;
}
