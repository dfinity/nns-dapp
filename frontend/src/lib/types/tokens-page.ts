import type { UnavailableTokenAmount } from "$lib/utils/token.utils";
import type { Principal } from "@dfinity/principal";
import type { Token, TokenAmount } from "@dfinity/utils";

export enum UserTokenAction {
  Send = "send",
  GoToDetail = "goToDetail",
  Receive = "receive",
}

export type UserTokenData = {
  universeId: Principal;
  title: string;
  subtitle?: string;
  balance: TokenAmount | UnavailableTokenAmount | "loading";
  token: Token;
  // Fees are included in the metadata of ICRC tokens, but this is not a list of only ICRC tokens
  fee: TokenAmount;
  logo: string;
  actions: UserTokenAction[];
};
