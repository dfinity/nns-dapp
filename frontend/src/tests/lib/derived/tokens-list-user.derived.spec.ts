import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import {
  ckBTCTokenBase,
  createIcpUserToken,
  icpTokenBase,
} from "$tests/mocks/tokens-page.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
import { get } from "svelte/store";

describe("tokens-list-user.derived", () => {
  const icpUserToken: UserTokenData = createIcpUserToken({
    balance: TokenAmountV2.fromUlps({
      amount: mockMainAccount.balanceE8s,
      token: NNS_TOKEN_DATA,
    }),
    actions: [UserTokenAction.GoToDetail],
  });
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
  const tetrisUserToken: UserTokenData = {
    ...tetrisTokenBase,
    balance: TokenAmountV2.fromUlps({
      amount: mockSnsMainAccount.balanceE8s,
      token: snsTetrisToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
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
  const pacmanUserToken: UserTokenData = {
    ...pacmanTokenBase,
    balance: TokenAmountV2.fromUlps({
      amount: mockSnsMainAccount.balanceE8s,
      token: snsPackmanToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };
  const ckBTCUserToken: UserTokenData = {
    ...ckBTCTokenBase,
    balance: TokenAmountV2.fromUlps({
      amount: mockCkBTCMainAccount.balanceE8s,
      token: mockCkBTCToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };

  describe("tokensListBaseStore", () => {
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      icrcAccountsStore.reset();
      snsAccountsStore.reset();
      tokensStore.reset();

      setSnsProjects([snsTetris, snsPacman]);
      tokensStore.setTokens({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
          token: mockCkBTCToken,
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
    });

    it("should return UnavailableBalance and no actions if no balance", () => {
      expect(get(tokensListUserStore)).toEqual([
        icpTokenBase,
        ckBTCTokenBase,
        tetrisTokenBase,
        pacmanTokenBase,
      ]);
    });

    it("should return balance and goToDetail action if ICP balance is present", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserToken,
        ckBTCTokenBase,
        tetrisTokenBase,
        pacmanTokenBase,
      ]);
    });

    it("should return balance and Send and Receive actions if ckBTC balance is present", () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpTokenBase,
        ckBTCUserToken,
        tetrisTokenBase,
        pacmanTokenBase,
      ]);
    });

    it("should return balance and Send and Receive actions if SNS project balance is present", () => {
      snsAccountsStore.setAccounts({
        accounts: [mockSnsMainAccount],
        certified: true,
        rootCanisterId: snsTetris.rootCanisterId,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpTokenBase,
        ckBTCTokenBase,
        tetrisUserToken,
        pacmanTokenBase,
      ]);
    });

    it("should return all balances and actoins if all balances are present", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
      });
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });
      snsAccountsStore.setAccounts({
        accounts: [mockSnsMainAccount],
        certified: true,
        rootCanisterId: snsTetris.rootCanisterId,
      });
      snsAccountsStore.setAccounts({
        accounts: [mockSnsMainAccount],
        certified: true,
        rootCanisterId: snsPacman.rootCanisterId,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserToken,
        ckBTCUserToken,
        tetrisUserToken,
        pacmanUserToken,
      ]);
    });
  });
});
