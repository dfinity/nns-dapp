import type { AccountIdentifierString } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type {
  PostMessageData,
  PostMessageDataActor,
} from "$lib/types/post-messages";
import type { GetAccountIdentifierTransactionsResponse } from "@junobuild/ledger";

export interface PostMessageDataRequestIcpWallet extends PostMessageDataActor {
  accountIdentifier: AccountIdentifierString;
  indexCanisterId: string;
}

export type JsonTransactionsText = string;

export type Wallet = Omit<
  GetAccountIdentifierTransactionsResponse,
  "transactions"
> & {
  newTransactions: JsonTransactionsText;
};

export interface PostMessageDataResponseWallet extends PostMessageData {
  wallet: Wallet;
}
