import type { UserTokenData, UserTokenLoading } from "$lib/types/tokens-page";

export const isUserTokenData = (
  userToken: UserTokenData | UserTokenLoading
): userToken is UserTokenData => {
  return userToken.balance !== "loading";
};
