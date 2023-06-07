import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataRequestTransactions extends PostMessageData {
  accountIdentifiers: IcrcAccountIdentifierText[];
  indexCanisterId: string;
}

export interface PostMessageDataResponseTransactions extends PostMessageData {
  transactions: PostMessageDataResponseTransaction[];
}

export interface PostMessageDataResponseTransaction {
  accountIdentifier: IcrcAccountIdentifierText;
  transactions: GetTransactionsResponse;
}
