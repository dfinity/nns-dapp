import type { UnavailableTokenAmount } from "$lib/utils/token.utils";
import type { Principal } from "@dfinity/principal";
import type { Token, TokenAmountV2 } from "@dfinity/utils";

export enum UserTokenAction {
  Send = "send",
  GoToDetail = "goToDetail",
  Receive = "receive",
}

export type UserTokenBase = {
  universeId: Principal;
  title: string;
  subtitle?: string;
  logo: string;
  actions: UserTokenAction[];
};

/**
 * By using two types, we can keep `token` and `fee` mandatory in `UserTokenData`.
 *
 * This makes it easy to manage opening modals and managing actions where those fields are mandatory
 * but they are not present while loading because the data is not yet there.
 *
 */
export type UserTokenLoading = UserTokenBase & {
  balance: "loading";
  actions: [];
};

export type UserTokenData = UserTokenBase & {
  balance: TokenAmountV2 | UnavailableTokenAmount;
  token: Token;
  // Fees are included in the metadata of ICRC tokens, but this is not a list of only ICRC tokens
  fee: TokenAmountV2;
};
