import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
import CKETH_LOGO from "$lib/assets/ckETH.svg";
import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import {
  UserTokenAction,
  type UserTokenData,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { TokenAmountV2 } from "@dfinity/utils";
import { mockCkBTCToken, mockCkTESTBTCToken } from "./ckbtc-accounts.mock";
import { mockCkETHToken } from "./cketh-accounts.mock";
import { mockSnsToken, principal } from "./sns-projects.mock";

export const icpTokenBase: UserTokenData = {
  universeId: OWN_CANISTER_ID,
  title: "Internet Computer",
  logo: IC_LOGO_ROUNDED,
  balance: new UnavailableTokenAmount(NNS_TOKEN_DATA),
  token: NNS_TOKEN_DATA,
  fee: TokenAmountV2.fromUlps({
    amount: NNS_TOKEN_DATA.fee,
    token: NNS_TOKEN_DATA,
  }),
  actions: [],
};
const snsTetrisToken = mockSnsToken;
const snsPackmanToken = {
  ...mockSnsToken,
  symbol: "PAC",
};

export const ckBTCTokenBase: UserTokenData = {
  universeId: CKBTC_UNIVERSE_CANISTER_ID,
  title: "ckBTC",
  logo: CKBTC_LOGO,
  balance: new UnavailableTokenAmount(mockCkBTCToken),
  token: mockCkBTCToken,
  fee: TokenAmountV2.fromUlps({
    amount: mockCkBTCToken.fee,
    token: mockCkBTCToken,
  }),
  actions: [],
};
export const ckETHTokenBase: UserTokenData = {
  universeId: CKETH_UNIVERSE_CANISTER_ID,
  title: "ckETH",
  logo: CKETH_LOGO,
  balance: new UnavailableTokenAmount(mockCkETHToken),
  token: mockCkETHToken,
  fee: TokenAmountV2.fromUlps({
    amount: mockCkETHToken.fee,
    token: mockCkETHToken,
  }),
  actions: [],
};
export const ckTESTBTCTokenBase: UserTokenData = {
  universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
  title: "ckTESTBTC",
  logo: CKTESTBTC_LOGO,
  balance: new UnavailableTokenAmount(mockCkTESTBTCToken),
  token: mockCkTESTBTCToken,
  fee: TokenAmountV2.fromUlps({
    amount: mockCkTESTBTCToken.fee,
    token: mockCkTESTBTCToken,
  }),
  actions: [],
};

export const userTokenPageMock: UserTokenData = {
  universeId: principal(0),
  title: "Test SNS",
  balance: TokenAmountV2.fromUlps({
    amount: 2160000000n,
    token: snsTetrisToken,
  }),
  logo: "sns-logo.svg",
  token: snsTetrisToken,
  fee: TokenAmountV2.fromUlps({
    amount: snsTetrisToken.fee,
    token: mockCkBTCToken,
  }),
  actions: [UserTokenAction.Send, UserTokenAction.Receive],
};

export const userTokensPageMock: UserTokenData[] = [
  {
    ...icpTokenBase,
    actions: [UserTokenAction.GoToDetail],
  },
  {
    ...ckBTCTokenBase,
    actions: [UserTokenAction.Send, UserTokenAction.Receive],
  },
  {
    universeId: principal(0),
    title: "Test SNS",
    balance: TokenAmountV2.fromUlps({
      amount: 2160000000n,
      token: { name: "Test SNS", symbol: "SNS1", decimals: 8 },
    }),
    token: snsTetrisToken,
    fee: TokenAmountV2.fromUlps({
      amount: snsTetrisToken.fee,
      token: snsTetrisToken,
    }),
    logo: "sns-logo.svg",
    actions: [UserTokenAction.Send, UserTokenAction.Receive],
  },
  {
    universeId: principal(1),
    title: "Test SNS 2",
    balance: TokenAmountV2.fromUlps({
      amount: 1180000000n,
      token: { name: "Test SNS", symbol: "SNS2", decimals: 8 },
    }),
    token: snsPackmanToken,
    fee: TokenAmountV2.fromUlps({
      amount: snsPackmanToken.fee,
      token: snsPackmanToken,
    }),
    logo: "sns-logo-2.svg",
    actions: [UserTokenAction.Send, UserTokenAction.Receive],
  },
];

export const createUserToken = (params: Partial<UserTokenData> = {}) => ({
  ...userTokenPageMock,
  ...params,
});

export const createIcpUserToken = (params: Partial<UserTokenData> = {}) => ({
  ...icpTokenBase,
  ...params,
});

export const defaultUserTokenLoading: UserTokenLoading = {
  universeId: principal(0),
  title: "Test SNS",
  balance: "loading",
  logo: "sns-logo.svg",
  actions: [],
};

export const createUserTokenLoading = (
  params: Partial<UserTokenLoading> = {}
) => ({
  ...defaultUserTokenLoading,
  ...params,
});
