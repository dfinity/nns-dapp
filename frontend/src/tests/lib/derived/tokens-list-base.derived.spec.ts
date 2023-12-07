import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { tokensListBaseStore } from "$lib/derived/tokens-list-base.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import {
  mockCkBTCToken,
  mockCkTESTBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import {
  ckBTCTokenBase,
  ckTESTBTCTokenBase,
  icpTokenBase,
} from "$tests/mocks/tokens-page.mock";
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
  const tetrisTokenBase: UserTokenData = {
    universeId: snsTetris.rootCanisterId,
    title: snsTetris.projectName,
    logo: "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/g3pce-2iaae/logo.png",
    balance: new UnavailableTokenAmount(snsTetris.tokenMetadata),
    token: snsTetris.tokenMetadata,
    fee: TokenAmountV2.fromUlps({
      amount: snsTetris.tokenMetadata.fee,
      token: snsTetris.tokenMetadata,
    }),
    actions: [],
  };
  const pacmanTokenBase: UserTokenData = {
    universeId: snsPacman.rootCanisterId,
    title: snsPacman.projectName,
    logo: "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/f7crg-kabae/logo.png",
    balance: new UnavailableTokenAmount(snsPacman.tokenMetadata),
    token: snsPacman.tokenMetadata,
    fee: TokenAmountV2.fromUlps({
      amount: snsPacman.tokenMetadata.fee,
      token: snsPacman.tokenMetadata,
    }),
    actions: [],
  };

  describe("tokensListBaseStore", () => {
    beforeEach(() => {
      resetSnsProjects();
      tokensStore.reset();
    });

    it("should return ICP without any other data loaded", () => {
      expect(get(tokensListBaseStore)).toEqual([icpTokenBase]);
    });

    it("should return ICP and SNS projects if loaded", () => {
      setSnsProjects([snsTetris, snsPacman]);
      tokensStore.setTokens({
        [snsTetris.rootCanisterId.toText()]: {
          token: snsTetrisToken,
          certified: true,
        },
        [snsPacman.rootCanisterId.toText()]: {
          token: snsPackmanToken,
          certified: true,
        },
      });

      expect(get(tokensListBaseStore)).toEqual([
        icpTokenBase,
        tetrisTokenBase,
        pacmanTokenBase,
      ]);
    });

    it("should return ICP, ckBTC and ckTESTBTC if loaded", () => {
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

      expect(get(tokensListBaseStore)).toEqual([
        icpTokenBase,
        ckBTCTokenBase,
        ckTESTBTCTokenBase,
      ]);
    });

    it("should return ICP, SNS, ckBTC and ckTESTBTC if loaded", () => {
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
        [snsTetris.rootCanisterId.toText()]: {
          token: snsTetrisToken,
          certified: true,
        },
        [snsPacman.rootCanisterId.toText()]: {
          token: snsPackmanToken,
          certified: true,
        },
      });

      expect(get(tokensListBaseStore)).toEqual([
        icpTokenBase,
        ckBTCTokenBase,
        ckTESTBTCTokenBase,
        tetrisTokenBase,
        pacmanTokenBase,
      ]);
    });
  });
});
