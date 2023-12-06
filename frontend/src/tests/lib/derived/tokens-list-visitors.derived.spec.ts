import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { UserTokenAction } from "$lib/types/tokens-page";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
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

  describe("tokensListVisitorsStore", () => {
    beforeEach(() => {
      resetSnsProjects();
      tokensStore.reset();
    });

    it("should return universes with action GoToDetail", () => {
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
      const universeTokens = get(tokensListVisitorsStore);

      universeTokens.forEach((token) => {
        expect(token.actions).toEqual([{ type: UserTokenAction.GoToDetail }]);
      });
    });
  });
});
