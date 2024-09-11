import type {
  UserTokenData,
  UserTokenFailed,
  UserTokenLoading,
} from "$lib/types/tokens-page";

export const isUserTokenLoading = (
  userToken: UserTokenData | UserTokenLoading | UserTokenFailed
): userToken is UserTokenLoading => {
  return userToken.balance === "loading";
};

export const isUserTokenFailed = (
  userToken: UserTokenData | UserTokenLoading | UserTokenFailed
): userToken is UserTokenFailed => {
  return userToken.balance === "failed";
};

export const isUserTokenData = (
  userToken: UserTokenData | UserTokenLoading | UserTokenFailed
): userToken is UserTokenData => {
  return !isUserTokenLoading(userToken) && !isUserTokenFailed(userToken);
};
