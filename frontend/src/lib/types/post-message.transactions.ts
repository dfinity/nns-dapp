import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataRequestTransactions extends PostMessageData {
  accounts: IcrcAccountIdentifierText[];
  ledgerCanisterId: string;
}

export interface PostMessageDataResponseTransactions extends PostMessageData {
  // TODO
}
