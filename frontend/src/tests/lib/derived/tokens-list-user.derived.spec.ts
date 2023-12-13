import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockCkETHMainAccount,
  mockCkETHToken,
} from "$tests/mocks/cketh-accounts.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import {
  ckBTCTokenBase,
  ckETHTokenBase,
  createIcpUserToken,
} from "$tests/mocks/tokens-page.mock";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
import { get } from "svelte/store";

describe("tokens-list-user.derived", () => {
  const icpUserTokenNoBalance: UserTokenData = createIcpUserToken({
    rowHref: buildAccountsUrl({ universe: OWN_CANISTER_ID_TEXT }),
  });
  const identityMainAccountIdentifier = encodeIcrcAccount({
    owner: mockIdentity.getPrincipal(),
  });
  const icpUserToken: UserTokenData = createIcpUserToken({
    balance: TokenAmountV2.fromUlps({
      amount: mockMainAccount.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    actions: [UserTokenAction.GoToDetail],
    rowHref: buildAccountsUrl({ universe: OWN_CANISTER_ID_TEXT }),
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
  const tetrisTokenNoBalance: UserTokenData = {
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
    rowHref: buildWalletUrl({
      universe: snsTetris.rootCanisterId.toText(),
      account: identityMainAccountIdentifier,
    }),
  };
  const tetrisUserToken: UserTokenData = {
    ...tetrisTokenNoBalance,
    balance: TokenAmountV2.fromUlps({
      amount: mockSnsMainAccount.balanceUlps,
      token: snsTetrisToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };
  const pacmanTokenNoBalance: UserTokenData = {
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
    rowHref: buildWalletUrl({
      universe: snsPacman.rootCanisterId.toText(),
      account: identityMainAccountIdentifier,
    }),
  };
  const pacmanUserToken: UserTokenData = {
    ...pacmanTokenNoBalance,
    balance: TokenAmountV2.fromUlps({
      amount: mockSnsMainAccount.balanceUlps,
      token: snsPackmanToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };
  const ckBTCTokenNoBalance: UserTokenData = {
    ...ckBTCTokenBase,
    balance: new UnavailableTokenAmount(mockCkBTCToken),
    token: mockCkBTCToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkBTCToken.fee,
      token: mockCkBTCToken,
    }),
    rowHref: buildWalletUrl({
      universe: ckBTCTokenBase.universeId.toText(),
      account: identityMainAccountIdentifier,
    }),
  };
  const ckBTCUserToken: UserTokenData = {
    ...ckBTCTokenNoBalance,
    balance: TokenAmountV2.fromUlps({
      amount: mockCkBTCMainAccount.balanceUlps,
      token: mockCkBTCToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };
  const ckETHTokenNobalance: UserTokenData = {
    ...ckETHTokenBase,
    balance: new UnavailableTokenAmount(mockCkETHToken),
    token: mockCkETHToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkETHToken.fee,
      token: mockCkETHToken,
    }),
    rowHref: buildWalletUrl({
      universe: ckETHTokenBase.universeId.toText(),
      account: identityMainAccountIdentifier,
    }),
  };
  const ckETHUserToken: UserTokenData = {
    ...ckETHTokenNobalance,
    balance: TokenAmountV2.fromUlps({
      amount: mockCkETHMainAccount.balanceUlps,
      token: mockCkETHToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };

  describe("tokensListUserStore", () => {
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      icrcAccountsStore.reset();
      snsAccountsStore.reset();
      tokensStore.reset();
      authStore.setForTesting(mockIdentity);

      setSnsProjects([snsTetris, snsPacman]);
      setCkETHCanisters();
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
        icpUserTokenNoBalance,
        ckBTCTokenNoBalance,
        ckETHTokenNobalance,
        tetrisTokenNoBalance,
        pacmanTokenNoBalance,
      ]);
    });

    it("should return balance and goToDetail action if ICP balance is present", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserToken,
        ckBTCTokenNoBalance,
        ckETHTokenNobalance,
        tetrisTokenNoBalance,
        pacmanTokenNoBalance,
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
        icpUserTokenNoBalance,
        ckBTCUserToken,
        ckETHTokenNobalance,
        tetrisTokenNoBalance,
        pacmanTokenNoBalance,
      ]);
    });

    it("should return balance and Send and Receive actions if ckETH balance is present", () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkETHMainAccount],
          certified: true,
        },
        universeId: CKETH_UNIVERSE_CANISTER_ID,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserTokenNoBalance,
        ckBTCTokenNoBalance,
        ckETHUserToken,
        tetrisTokenNoBalance,
        pacmanTokenNoBalance,
      ]);
    });

    it("should return balance and Send and Receive actions if SNS project balance is present", () => {
      snsAccountsStore.setAccounts({
        accounts: [mockSnsMainAccount],
        certified: true,
        rootCanisterId: snsTetris.rootCanisterId,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserTokenNoBalance,
        ckBTCTokenNoBalance,
        ckETHTokenNobalance,
        tetrisUserToken,
        pacmanTokenNoBalance,
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
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkETHMainAccount],
          certified: true,
        },
        universeId: CKETH_UNIVERSE_CANISTER_ID,
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
        ckETHUserToken,
        tetrisUserToken,
        pacmanUserToken,
      ]);
    });
  });
});
