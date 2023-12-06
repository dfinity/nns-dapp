import type { UnavailableTokenAmount } from "$lib/utils/token.utils";
import type { Principal } from "@dfinity/principal";
import type { Token, TokenAmount } from "@dfinity/utils";

export enum UserTokenAction {
  Send = "send",
  GoToDetail = "goToDetail",
  Receive = "receive",
}

export type UserTokenActionData = {
  type: UserTokenAction;
  label?: string;
};

export type UserTokenBase = {
  universeId: Principal;
  title: string;
  subtitle?: string;
  logo: string;
  actions: UserTokenActionData[];
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
  balance: TokenAmount | UnavailableTokenAmount;
  token: Token;
  // Fees are included in the metadata of ICRC tokens, but this is not a list of only ICRC tokens
  fee: TokenAmount;
};

export type UserTokenTableData = Array<
  UserTokenData | UserTokenLoading | UserTokenBase
>;
