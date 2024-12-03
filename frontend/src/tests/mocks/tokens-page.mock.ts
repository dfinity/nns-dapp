import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
import CKETH_LOGO from "$lib/assets/ckETH.svg";
import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import {
  UserTokenAction,
  type UserTokenBase,
  type UserTokenData,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { TokenAmountV2, nonNullish } from "@dfinity/utils";
import { mockCkBTCToken } from "./ckbtc-accounts.mock";
import { mockSnsToken, principal } from "./sns-projects.mock";

export const icpTokenBase: UserTokenBase = {
  universeId: OWN_CANISTER_ID,
  ledgerCanisterId: LEDGER_CANISTER_ID,
  title: "Internet Computer",
  logo: IC_LOGO_ROUNDED,
  actions: [],
};
const icpHref = `/accounts/?u=${OWN_CANISTER_ID_TEXT}`;
const icpTokenNoBalance: UserTokenData = {
  ...icpTokenBase,
  balance: new UnavailableTokenAmount(NNS_TOKEN_DATA),
  token: NNS_TOKEN_DATA,
  fee: TokenAmountV2.fromUlps({
    amount: NNS_TOKEN_DATA.fee,
    token: NNS_TOKEN_DATA,
  }),
  rowHref: icpHref,
  domKey: icpHref,
};
const snsTetrisToken = mockSnsToken;
const snsPackmanToken = {
  ...mockSnsToken,
  symbol: "PAC",
};
export const ckBTCTokenBase: UserTokenBase = {
  universeId: CKBTC_UNIVERSE_CANISTER_ID,
  ledgerCanisterId: CKBTC_UNIVERSE_CANISTER_ID,
  title: "ckBTC",
  logo: CKBTC_LOGO,
  actions: [],
};
export const ckETHTokenBase: UserTokenBase = {
  universeId: CKETH_UNIVERSE_CANISTER_ID,
  ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
  title: "ckETH",
  logo: CKETH_LOGO,
  actions: [],
};
export const ckTESTBTCTokenBase: UserTokenBase = {
  universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
  ledgerCanisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
  title: "ckTESTBTC",
  logo: CKTESTBTC_LOGO,
  actions: [],
};

const snsHref = `/wallet/?u=${principal(0).toText()}`;
export const userTokenPageMock: UserTokenData = {
  universeId: principal(0),
  ledgerCanisterId: principal(1),
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
  rowHref: snsHref,
  domKey: snsHref,
};

const ckBTCHref = `/wallet/?u=${CKBTC_UNIVERSE_CANISTER_ID.toText()}`;
export const userTokensPageMock: UserTokenData[] = [
  {
    ...icpTokenNoBalance,
    actions: [UserTokenAction.GoToDetail],
  },
  {
    ...ckBTCTokenBase,
    balance: new UnavailableTokenAmount(mockCkBTCToken),
    token: mockCkBTCToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkBTCToken.fee,
      token: mockCkBTCToken,
    }),
    actions: [UserTokenAction.Send, UserTokenAction.Receive],
    rowHref: ckBTCHref,
    domKey: ckBTCHref,
  },
  {
    universeId: principal(0),
    ledgerCanisterId: principal(2),
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
    rowHref: `/wallet/?u=${principal(0).toText()}`,
    domKey: `/wallet/?u=${principal(0).toText()}`,
  },
  {
    universeId: principal(1),
    ledgerCanisterId: principal(3),
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
    rowHref: `/wallet/?u=${principal(1).toText()}`,
    domKey: `/wallet/?u=${principal(1).toText()}`,
  },
];

export const createUserToken = (params: Partial<UserTokenData> = {}) => {
  const rowHref = nonNullish(params.rowHref)
    ? params.rowHref
    : nonNullish(params.universeId)
      ? `/wallet/?u=${params.universeId.toText()}`
      : userTokenPageMock.rowHref;
  return {
    ...userTokenPageMock,
    ...params,
    rowHref,
    domKey: rowHref,
  };
};

export const createIcpUserToken = (params: Partial<UserTokenData> = {}) => ({
  ...icpTokenNoBalance,
  ...params,
});

export const defaultUserTokenLoading: UserTokenLoading = {
  universeId: principal(0),
  ledgerCanisterId: principal(2),
  title: "Test SNS",
  balance: "loading",
  logo: "sns-logo.svg",
  actions: [],
  rowHref: `/wallet/?u=${principal(0).toText()}`,
  domKey: `/wallet/?u=${principal(0).toText()}`,
};

export const createUserTokenLoading = (
  params: Partial<UserTokenLoading> = {}
) => ({
  ...defaultUserTokenLoading,
  ...params,
});
