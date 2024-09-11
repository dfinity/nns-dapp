import type {
  UserTokenData,
  UserTokenFailed,
  UserTokenLoading,
} from "$lib/types/tokens-page";
import { Principal } from "@dfinity/principal";

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

export const toUserTokenFailed = (
  ledgerCanisterIdText: string
): UserTokenFailed => ({
  universeId: Principal.fromText(ledgerCanisterIdText),
  // Title will be used for sorting.
  title: ledgerCanisterIdText,
  logo: "",
  balance: "failed",
  domKey: ledgerCanisterIdText,
  actions: [],
});
