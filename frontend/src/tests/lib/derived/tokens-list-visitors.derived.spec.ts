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
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
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
    projectName: "Pacman",
    lifecycle: SnsSwapLifecycle.Committed,
    tokenMetadata: snsPackmanToken,
  };
  const mockCkTESTBTCToken = {
    ...mockCkBTCToken,
    symbol: "ckTESTBTC",
    name: "ckTESTBTC",
  };

  const icpVisitorToken: UserTokenData = createIcpUserToken({
    balance: new UnavailableTokenAmount(NNS_TOKEN_DATA),
    actions: [UserTokenAction.GoToDetail],
  });
  const tetrisTokenLoading: UserTokenLoading = {
    universeId: snsTetris.rootCanisterId,
    title: snsTetris.projectName,
    logo: "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/g3pce-2iaae/logo.png",
    balance: "loading",
    actions: [],
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
  };
  const pacmanTokenLoading: UserTokenLoading = {
    universeId: snsPacman.rootCanisterId,
    title: snsPacman.projectName,
    logo: "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/f7crg-kabae/logo.png",
    balance: "loading",
    actions: [],
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
  };
  const ckBTCTokenLoading: UserTokenLoading = {
    ...ckBTCTokenBase,
    balance: "loading",
    actions: [],
  };
  const ckTESTBTCTokenLoading: UserTokenLoading = {
    ...ckTESTBTCTokenBase,
    balance: "loading",
    actions: [],
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
  };
  const ckETHVisitorToken: UserTokenData = {
    ...ckETHTokenBase,
    balance: new UnavailableTokenAmount(mockCkETHToken),
    token: mockCkETHToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkETHToken.fee,
      token: mockCkETHToken,
    }),
    actions: [UserTokenAction.GoToDetail],
  };

  describe("tokensListVisitorsStore", () => {
    beforeEach(() => {
      resetSnsProjects();
      tokensStore.reset();
      setSnsProjects([snsTetris, snsPacman]);
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
        tetrisTokenLoading,
        pacmanTokenLoading,
      ]);
    });

    it("should return unavailable balance and GoToDetail action if token is present", () => {
      tokensStore.setTokens({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
          token: mockCkBTCToken,
          certified: true,
        },
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: {
          token: mockCkTESTBTCToken,
          certified: true,
        },
        [snsTetris.rootCanisterId.toText()]: {
          token: snsTetrisToken,
          certified: true,
        },
        [snsPacman.rootCanisterId.toText()]: {
          token: snsPackmanToken,
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
