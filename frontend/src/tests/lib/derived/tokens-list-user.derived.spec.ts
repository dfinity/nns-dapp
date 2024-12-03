import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
import { authStore } from "$lib/stores/auth.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  UserTokenAction,
  type UserTokenData,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
  mockCkTESTBTCToken,
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
  ckTESTBTCTokenBase,
  createIcpUserToken,
  icpTokenBase,
} from "$tests/mocks/tokens-page.mock";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
import { get } from "svelte/store";

describe("tokens-list-user.derived", () => {
  const icpHref = buildAccountsUrl({ universe: OWN_CANISTER_ID_TEXT });
  const icpUserToken: UserTokenData = createIcpUserToken({
    balance: TokenAmountV2.fromUlps({
      amount: mockMainAccount.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    actions: [UserTokenAction.GoToDetail],
    rowHref: icpHref,
    domKey: icpHref,
    accountIdentifier: undefined,
  });
  const icpUserTokenLoading: UserTokenLoading = {
    ...icpTokenBase,
    balance: "loading",
    actions: [],
    rowHref: icpHref,
    domKey: icpHref,
  };
  const snsTetrisToken = mockSnsToken;
  const tetrisRootCanisterId = rootCanisterIdMock;
  const tetrisLedgerCanisterId = principal(2);
  const pacmanRootCanisterId = principal(1);
  const pacmanLedgerCanisterId = principal(3);
  const snsTetris = {
    rootCanisterId: tetrisRootCanisterId,
    ledgerCanisterId: tetrisLedgerCanisterId,
    projectName: "Tetris",
    lifecycle: SnsSwapLifecycle.Committed,
    tokenMetadata: snsTetrisToken,
  };
  const snsPackmanToken = {
    ...mockSnsToken,
    symbol: "PAC",
  };
  const snsPacman = {
    rootCanisterId: pacmanRootCanisterId,
    ledgerCanisterId: pacmanLedgerCanisterId,
    projectName: "Pacman",
    lifecycle: SnsSwapLifecycle.Committed,
    tokenMetadata: snsPackmanToken,
  };
  const tetrisHref = buildWalletUrl({
    universe: snsTetris.rootCanisterId.toText(),
  });
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
  const tetrisUserToken: UserTokenData = {
    ...tetrisTokenLoading,
    balance: TokenAmountV2.fromUlps({
      amount: mockSnsMainAccount.balanceUlps,
      token: snsTetrisToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
    token: snsTetris.tokenMetadata,
    fee: TokenAmountV2.fromUlps({
      amount: snsTetris.tokenMetadata.fee,
      token: snsTetris.tokenMetadata,
    }),
    rowHref: tetrisHref,
    domKey: tetrisHref,
    accountIdentifier: mockSnsMainAccount.identifier,
  };
  const pacmanHref = buildWalletUrl({
    universe: snsPacman.rootCanisterId.toText(),
  });
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
  const pacmanUserToken: UserTokenData = {
    ...pacmanTokenLoading,
    balance: TokenAmountV2.fromUlps({
      amount: mockSnsMainAccount.balanceUlps,
      token: snsPackmanToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
    token: snsPacman.tokenMetadata,
    fee: TokenAmountV2.fromUlps({
      amount: snsPacman.tokenMetadata.fee,
      token: snsPacman.tokenMetadata,
    }),
    rowHref: pacmanHref,
    domKey: pacmanHref,
    accountIdentifier: mockSnsMainAccount.identifier,
  };
  const ckBTCHref = buildWalletUrl({
    universe: ckBTCTokenBase.universeId.toText(),
  });
  const ckBTCTokenLoading: UserTokenLoading = {
    ...ckBTCTokenBase,
    balance: "loading",
    actions: [],
    rowHref: ckBTCHref,
    domKey: ckBTCHref,
  };
  const ckTESTBTCHref = buildWalletUrl({
    universe: ckTESTBTCTokenBase.universeId.toText(),
  });
  const ckTESTBTCTokenLoading: UserTokenLoading = {
    ...ckTESTBTCTokenBase,
    balance: "loading",
    actions: [],
    rowHref: ckTESTBTCHref,
    domKey: ckTESTBTCHref,
  };
  const ckBTCUserToken: UserTokenData = {
    ...ckBTCTokenBase,
    balance: TokenAmountV2.fromUlps({
      amount: mockCkBTCMainAccount.balanceUlps,
      token: mockCkBTCToken,
    }),
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
    token: mockCkBTCToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkBTCToken.fee,
      token: mockCkBTCToken,
    }),
    rowHref: ckBTCHref,
    domKey: ckBTCHref,
    accountIdentifier: mockCkBTCMainAccount.identifier,
  };
  const ckETHHref = buildWalletUrl({
    universe: ckETHTokenBase.universeId.toText(),
  });
  const ckETHTokenLoading: UserTokenLoading = {
    ...ckETHTokenBase,
    balance: "loading",
    actions: [],
    rowHref: ckETHHref,
    domKey: ckETHHref,
  };
  const ckETHUserToken: UserTokenData = {
    ...ckETHTokenBase,
    balance: TokenAmountV2.fromUlps({
      amount: mockCkETHMainAccount.balanceUlps,
      token: mockCkETHToken,
    }),
    token: mockCkETHToken,
    fee: TokenAmountV2.fromUlps({
      amount: mockCkETHToken.fee,
      token: mockCkETHToken,
    }),
    rowHref: ckETHHref,
    domKey: ckETHHref,
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
    accountIdentifier: mockCkETHMainAccount.identifier,
  };

  describe("tokensListUserStore", () => {
    beforeEach(() => {
      resetAccountsForTesting();
      authStore.setForTesting(mockIdentity);
      resetSnsProjects();

      setSnsProjects([snsTetris, snsPacman]);
      setCkETHCanisters();
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
    });

    it("should return loading user token if no balance", () => {
      expect(get(tokensListUserStore)).toEqual([
        icpUserTokenLoading,
        ckBTCTokenLoading,
        ckTESTBTCTokenLoading,
        ckETHTokenLoading,
        tetrisTokenLoading,
        pacmanTokenLoading,
      ]);
    });

    it("should loading user token if no token", () => {
      tokensStore.reset();
      expect(get(tokensListUserStore)).toEqual([
        icpUserTokenLoading,
        ckBTCTokenLoading,
        ckTESTBTCTokenLoading,
        // ckEHT is not in the list because the name of the universe comes from the token.
        tetrisTokenLoading,
        pacmanTokenLoading,
      ]);
    });

    it("should return balance and goToDetail action if ICP balance is present", () => {
      setAccountsForTesting({
        main: mockMainAccount,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserToken,
        ckBTCTokenLoading,
        ckTESTBTCTokenLoading,
        ckETHTokenLoading,
        tetrisTokenLoading,
        pacmanTokenLoading,
      ]);
    });

    it("should return balance and Send and Receive actions if ckBTC balance is present", () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserTokenLoading,
        ckBTCUserToken,
        ckTESTBTCTokenLoading,
        ckETHTokenLoading,
        tetrisTokenLoading,
        pacmanTokenLoading,
      ]);
    });

    it("should return balance and Send and Receive actions if ckETH balance is present", () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkETHMainAccount],
          certified: true,
        },
        ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserTokenLoading,
        ckBTCTokenLoading,
        ckTESTBTCTokenLoading,
        ckETHUserToken,
        tetrisTokenLoading,
        pacmanTokenLoading,
      ]);
    });

    it("should return balance and Send and Receive actions if SNS project balance is present", () => {
      icrcAccountsStore.set({
        accounts: { accounts: [mockSnsMainAccount], certified: true },
        ledgerCanisterId: snsTetris.ledgerCanisterId,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserTokenLoading,
        ckBTCTokenLoading,
        ckTESTBTCTokenLoading,
        ckETHTokenLoading,
        tetrisUserToken,
        pacmanTokenLoading,
      ]);
    });

    it("should return all balances and actions if all balances are present", () => {
      setAccountsForTesting({
        main: mockMainAccount,
      });
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
      });
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkETHMainAccount],
          certified: true,
        },
        ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
      });
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockSnsMainAccount],
          certified: true,
        },
        ledgerCanisterId: snsTetris.ledgerCanisterId,
      });
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockSnsMainAccount],
          certified: true,
        },
        ledgerCanisterId: snsPacman.ledgerCanisterId,
      });
      expect(get(tokensListUserStore)).toEqual([
        icpUserToken,
        ckBTCUserToken,
        ckTESTBTCTokenLoading,
        ckETHUserToken,
        tetrisUserToken,
        pacmanUserToken,
      ]);
    });
  });
});
