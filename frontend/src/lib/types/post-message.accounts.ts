import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataRequestAccounts extends PostMessageData {
  accountIdentifiers: IcrcAccountIdentifierText[];
  ledgerCanisterId: string;
}

export interface PostMessageDataResponseAccounts extends PostMessageData {
  // TODO
}
