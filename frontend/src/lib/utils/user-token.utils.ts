import type {
  UserTokenBase,
  UserTokenData,
  UserTokenLoading,
} from "$lib/types/tokens-page";

export const isUserTokenData = (
  userToken: UserTokenData | UserTokenLoading | UserTokenBase
): userToken is UserTokenData => {
  return "balance" in userToken && userToken.balance !== "loading";
};
