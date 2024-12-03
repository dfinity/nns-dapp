import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  UserTokenAction,
  type UserTokenData,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import {
  ledgerCanisterIdMock,
  rootCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import {
  ckBTCTokenBase,
  ckETHTokenBase,
  ckTESTBTCTokenBase,
  createIcpUserToken,
} from "$tests/mocks/tokens-page.mock";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
import { get } from "svelte/store";

describe("tokens-list-base.derived", () => {
  const snsTetrisToken = mockSnsToken;
  const snsTetris = {
    rootCanisterId: rootCanisterIdMock,
    ledgerCanisterId: ledgerCanisterIdMock,
    projectName: "Tetris",
    lifecycle: SnsSwapLifecycle.Committed,
    tokenMetadata: snsTetrisToken,
  };
  const snsPackmanToken = {
    ...mockSnsToken,
    symbol: "PAC",
  };
  const snsPacman = {
    rootCanisterId: principal(1),
    ledgerCanisterId: principal(2),
    projectName: "Pacman",
    lifecycle: SnsSwapLifecycle.Committed,
    tokenMetadata: snsPackmanToken,
  };
  const mockCkTESTBTCToken = {
    ...mockCkBTCToken,
    symbol: "ckTESTBTC",
    name: "ckTESTBTC",
  };

  const icpHref = `/accounts/?u=${OWN_CANISTER_ID_TEXT}`;
  const icpVisitorToken: UserTokenData = createIcpUserToken({
    balance: new UnavailableTokenAmount(NNS_TOKEN_DATA),
    actions: [UserTokenAction.GoToDetail],
    rowHref: icpHref,
    domKey: icpHref,
  });
  const tetrisHref = `/wallet/?u=${snsTetris.rootCanisterId.toText()}`;
  const tetrisTokenLoading: UserTokenLoading = {
    universeId: snsTetris.rootCanisterId,
    ledgerCanisterId: snsTetris.ledgerCanisterId,
    title: snsTetris.projectName,
    logo: "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/g3pce-2iaae/logo.png",
    balance: "loading",
    actions: [],
    rowHref: tetrisHref,
    domKey: tetrisHref,
  };
  const tetrisVisitorToken: UserTokenData = {
    ...tetrisTokenLoading,
    balance: new UnavailableTokenAmount(snsTetris.tokenMetadata),
    actions: [UserTokenAction.GoToDetail],
    token: snsTetris.tokenMetadata,
    fee: TokenAmountV2.fromUlps({
      amount: snsTetris.tokenMetadata.fee,
      token: snsTetris.tokenMetadata,
    }),
    rowHref: tetrisHref,
    domKey: tetrisHref,
  };
  const pacmanHref = `/wallet/?u=${snsPacman.rootCanisterId.toText()}`;
  const pacmanTokenLoading: UserTokenLoading = {
    universeId: snsPacman.rootCanisterId,
    ledgerCanisterId: snsPacman.ledgerCanisterId,
    title: snsPacman.projectName,
    logo: "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/f7crg-kabae/logo.png",
    balance: "loading",
    actions: [],
    rowHref: pacmanHref,
    domKey: pacmanHref,
  };
  const pacmanVisitorToken: UserTokenData = {
    ...pacmanTokenLoading,
    balance: new UnavailableTokenAmount(snsPacman.tokenMetadata),
    actions: [UserTokenAction.GoToDetail],
    token: snsPacman.tokenMetadata,
    fee: TokenAmountV2.fromUlps({
      amount: snsPacman.tokenMetadata.fee,
      token: snsPacman.tokenMetadata,
    }),
    rowHref: pacmanHref,
    domKey: pacmanHref,
  };
  const ckBTCHref = `/wallet/?u=${CKBTC_UNIVERSE_CANISTER_ID.toText()}`;
  const ckBTCTokenLoading: UserTokenLoading = {
    ...ckBTCTokenBase,
    balance: "loading",
    actions: [],
    rowHref: ckBTCHref,
    domKey: ckBTCHref,
  };
  const ckTESTBTCHref = `/wallet/?u=${CKTESTBTC_UNIVERSE_CANISTER_ID.toText()}`;
  const ckTESTBTCTokenLoading: UserTokenLoading = {
    ...ckTESTBTCTokenBase,
    balance: "loading",
    actions: [],
    rowHref: ckTESTBTCHref,
    domKey: ckTESTBTCHref,
  };
  const ckTESTBTCVisitorToken: UserTokenData = {
    ...ckTESTBTCTokenBase,
    balance: new UnavailableTokenAmount(mockCkTESTBTCToken),
    actions: [UserTokenAction.GoToDetail],
    token: mockCkTESTBTCToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkTESTBTCToken.fee,
      token: mockCkTESTBTCToken,
    }),
    rowHref: ckTESTBTCHref,
    domKey: ckTESTBTCHref,
  };
  const ckBTCVisitorToken: UserTokenData = {
    ...ckBTCTokenBase,
    balance: new UnavailableTokenAmount(mockCkBTCToken),
    actions: [UserTokenAction.GoToDetail],
    token: mockCkBTCToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkBTCToken.fee,
      token: mockCkBTCToken,
    }),
    rowHref: ckBTCHref,
    domKey: ckBTCHref,
  };
  const ckETHHref = `/wallet/?u=${ckETHTokenBase.universeId.toText()}`;
  const ckETHVisitorToken: UserTokenData = {
    ...ckETHTokenBase,
    balance: new UnavailableTokenAmount(mockCkETHToken),
    token: mockCkETHToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkETHToken.fee,
      token: mockCkETHToken,
    }),
    actions: [UserTokenAction.GoToDetail],
    rowHref: ckETHHref,
    domKey: ckETHHref,
  };

  describe("tokensListVisitorsStore", () => {
    beforeEach(() => {
      resetSnsProjects();
      setCkETHCanisters();
    });

    it("should return loading universes (except ICP) if token is not present", () => {
      tokensStore.reset();
      expect(get(tokensListVisitorsStore)).toEqual([
        // Token is hardcoded in the store
        icpVisitorToken,
        ckBTCTokenLoading,
        ckTESTBTCTokenLoading,
        // ckEHT is not in the list because the name of the universe comes from the token.
        // SNS tokens are never loading because their token data comes with the
        // aggregator data.
      ]);
    });

    it("should return unavailable balance and GoToDetail action if token is present", () => {
      setSnsProjects([snsTetris, snsPacman]);
      tokensStore.setTokens({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
          token: mockCkBTCToken,
          certified: true,
        },
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: {
          token: mockCkTESTBTCToken,
          certified: true,
        },
      });
      expect(get(tokensListVisitorsStore)).toEqual([
        icpVisitorToken,
        ckBTCVisitorToken,
        ckTESTBTCVisitorToken,
        ckETHVisitorToken,
        tetrisVisitorToken,
        pacmanVisitorToken,
      ]);
    });
  });
});
