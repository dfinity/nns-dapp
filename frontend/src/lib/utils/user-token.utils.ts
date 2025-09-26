import UNKNOWN_LOGO from "$lib/assets/question-mark.svg";
import { uninstalledIndexCanistersId } from "$lib/constants/canister-ids.constants";
import {
  UserTokenAction,
  type UserTokenData,
  type UserTokenFailed,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { Principal } from "@icp-sdk/core/principal";

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

export const isIndexCanisterOfTokenUninstalled = (
  userToken: UserTokenData | UserTokenLoading | UserTokenFailed
): userToken is UserTokenFailed => {
  return uninstalledIndexCanistersId.includes(userToken.universeId.toText());
};

export const isUserTokenData = (
  userToken: UserTokenData | UserTokenLoading | UserTokenFailed
): userToken is UserTokenData => {
  return !isUserTokenLoading(userToken) && !isUserTokenFailed(userToken);
};

export const toUserTokenFailed = (
  ledgerCanisterIdText: string
): UserTokenFailed => {
  const ledgerCanisterId = Principal.fromText(ledgerCanisterIdText);
  return {
    universeId: ledgerCanisterId,
    ledgerCanisterId,
    // Title will be used for sorting.
    title: ledgerCanisterIdText,
    logo: UNKNOWN_LOGO,
    balance: "failed",
    domKey: ledgerCanisterIdText,
    actions: [UserTokenAction.GoToDashboard, UserTokenAction.Remove],
  };
};
