import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { principal } from "./sns-projects.mock";

export const userTokenPageMock: UserTokenData = {
  universeId: principal(0),
  title: "Test SNS",
  balance: TokenAmount.fromE8s({
    amount: 2160000000n,
    token: { name: "Test SNS", symbol: "SNS1" },
  }),
  logo: "sns-logo.svg",
  actions: [UserTokenAction.Send, UserTokenAction.Receive],
};

export const userTokensPageMock: UserTokenData[] = [
  {
    universeId: OWN_CANISTER_ID,
    title: "Internet Computer",
    balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
    logo: "icp-logo.svg",
    actions: [UserTokenAction.GoToDetail],
  },
  {
    universeId: CKBTC_UNIVERSE_CANISTER_ID,
    title: "CkBTC",
    balance: TokenAmount.fromE8s({
      amount: 1160000000n,
      token: { name: "CkBTC", symbol: "CkBTC" },
    }),
    logo: "ckbtc-logo.svg",
    actions: [UserTokenAction.Send, UserTokenAction.Receive],
  },
  {
    universeId: principal(0),
    title: "Test SNS",
    balance: TokenAmount.fromE8s({
      amount: 2160000000n,
      token: { name: "Test SNS", symbol: "SNS1" },
    }),
    logo: "sns-logo.svg",
    actions: [UserTokenAction.Send, UserTokenAction.Receive],
  },
  {
    universeId: principal(1),
    title: "Test SNS 2",
    balance: TokenAmount.fromE8s({
      amount: 1180000000n,
      token: { name: "Test SNS", symbol: "SNS2" },
    }),
    logo: "sns-logo-2.svg",
    actions: [UserTokenAction.Send, UserTokenAction.Receive],
  },
];

export const createUserToken = (params: Partial<UserTokenData> = {}) => ({
  ...userTokenPageMock,
  ...params,
});
