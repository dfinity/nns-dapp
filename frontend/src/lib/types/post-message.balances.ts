import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type {
  PostMessageData,
  PostMessageDataActor,
} from "$lib/types/post-messages";

export interface PostMessageDataRequestBalances extends PostMessageDataActor {
  accountIdentifiers: IcrcAccountIdentifierText[];
  ledgerCanisterId: string;
}

export interface PostMessageDataResponseBalances extends PostMessageData {
  balances: PostMessageDataResponseBalance[];
}

export type PostMessageDataResponseBalance = {
  accountIdentifier: IcrcAccountIdentifierText;
  balance: bigint;
};
