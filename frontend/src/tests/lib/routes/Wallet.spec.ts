import * as ckbtcMinterApi from "$lib/api/ckbtc-minter.api";
import * as governanceApi from "$lib/api/governance.api";
import * as icpIndexApi from "$lib/api/icp-index.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETH_LEDGER_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import Wallet from "$lib/routes/Wallet.svelte";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockSnsFullProject,
  mockToken,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { WalletPo } from "$tests/page-objects/Wallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/ckbtc-minter.api");

vi.mock("$lib/services/icrc-transactions.services", () => {
  return {
    loadIcrcAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadIcrcAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-info.services", () => {
  return {
    loadCkBTCInfo: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/worker-balances.services", () => ({
  initBalancesWorker: vi.fn(() =>
    Promise.resolve({
      startBalancesTimer: () => {
        // Do nothing
      },
      stopBalancesTimer: () => {
        // Do nothing
      },
    })
  ),
}));

vi.mock("$lib/services/worker-transactions.services", () => ({
  initTransactionsWorker: vi.fn(() =>
    Promise.resolve({
      startTransactionsTimer: () => {
        // Do nothing
      },
      stopTransactionsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("Wallet", () => {
  let ckEthBalance = 1000000000000000000n;
  const importedTokenId = principal(123);
  beforeEach(() => {
    resetIdentity();
    vi.clearAllMocks();
    importedTokensStore.reset();
    setCkETHCanisters();
    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        ledgerCanisterId: mockSnsFullProject.summary.ledgerCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    setCkETHCanisters();
    setAccountsForTesting(mockAccountsStoreData);
    vi.spyOn(icrcLedgerApi, "icrcTransfer").mockResolvedValue(1234n);
    vi.mocked(ckbtcMinterApi.retrieveBtcStatusV2ByAccount).mockResolvedValue(
      []
    );

    icrcAccountsStore.reset();
    ckEthBalance = 1000000000000000000n;
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(
      async ({ canisterId }) => {
        if (canisterId.toText() === CKETH_UNIVERSE_CANISTER_ID.toText()) {
          return ckEthBalance;
        }
        if (canisterId.toText() === CKBTC_UNIVERSE_CANISTER_ID.toText()) {
          return mockCkBTCMainAccount.balanceUlps;
        }
        if (
          canisterId.toText() ===
          mockSnsFullProject.summary.ledgerCanisterId.toText()
        ) {
          return mockSnsMainAccount.balanceUlps;
        }
        if (canisterId.toText() === importedTokenId.toText()) {
          return mockSnsMainAccount.balanceUlps;
        }
        throw new Error(`Unexpected canisterId: ${canisterId.toText()}`);
      }
    );
    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockImplementation(
      async ({ canisterId }) => {
        if (canisterId.toText() === CKETH_UNIVERSE_CANISTER_ID.toText()) {
          return mockCkETHToken;
        }
        if (canisterId.toText() === CKBTC_UNIVERSE_CANISTER_ID.toText()) {
          return mockCkBTCToken;
        }
        if (canisterId.toText() === importedTokenId.toText()) {
          return mockToken;
        }
        throw new Error(`Unexpected canisterId: ${canisterId.toText()}`);
      }
    );
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
  });

  describe("nns context", () => {
    it("should render NnsWallet", () => {
      page.mock({ routeId: AppPath.Wallet });

      const { getByTestId } = render(Wallet, {
        props: {
          accountIdentifier: OWN_CANISTER_ID_TEXT,
        },
      });
      expect(getByTestId("nns-wallet")).toBeInTheDocument();
    });
  });

  describe("sns context", () => {
    beforeAll(() => {
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Wallet,
      });

      tokensStore.setToken({
        canisterId: mockSnsFullProject.summary.ledgerCanisterId,
        token: mockSnsFullProject.summary.token,
        certified: true,
      });
    });

    const renderComponent = () => {
      const { container } = render(Wallet, {
        props: {
          accountIdentifier: mockSnsMainAccount.identifier,
        },
      });
      return WalletPo.under(new JestPageObjectElement(container));
    };

    it("should render SnsWallet", async () => {
      const po = renderComponent();
      expect(await po.getSnsWalletPo().isPresent()).toBe(true);
    });

    it("should open transaction modal", async () => {
      const po = renderComponent();
      expect(await po.getIcrcTokenTransactionModalPo().isPresent()).toBe(false);
      await po.getSnsWalletPo().clickSendButton();
      expect(await po.getIcrcTokenTransactionModalPo().isPresent()).toBe(true);
    });
  });

  it("should render ckBTC wallet", () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });

    const { getByTestId } = render(Wallet, {
      props: {
        accountIdentifier: principal(0).toText(),
      },
    });
    expect(getByTestId("ckbtc-wallet-component")).toBeInTheDocument();
  });

  it("should render an Icrc wallet", () => {
    page.mock({
      data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });

    const { getByTestId } = render(Wallet, {
      props: {
        accountIdentifier: principal(0).toText(),
      },
    });
    expect(getByTestId("icrc-wallet-component")).toBeInTheDocument();
  });

  it("user can transfer ckETH tokens and balance is refreshed", async () => {
    const amount = 2;
    const E18S_PER_TOKEN = 10n ** 18n;
    const amountE18s = BigInt(amount) * E18S_PER_TOKEN;
    const balanceAfterTransfer = 1110000000000000000n;
    const balanceBeforeTransfer = balanceAfterTransfer + amountE18s;
    ckEthBalance = balanceBeforeTransfer;

    page.mock({
      data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });

    const { container } = render(Wallet, {
      props: {
        accountIdentifier: mockIcrcMainAccount.identifier,
      },
    });

    const po = WalletPo.under(new JestPageObjectElement(container));

    await runResolvedPromises();

    const pagePo = po.getIcrcWalletPo();
    expect(await pagePo.getWalletPageHeadingPo().getTitle()).toBe("3.11 ckETH");

    await po.clickSendCkETH();

    const modalPo = po.getIcrcTokenTransactionModalPo();
    expect(await modalPo.isPresent()).toBe(true);

    const toAccount = {
      owner: principal(2),
    };

    // Load data with query + Update calls
    expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenCalledTimes(2);
    ckEthBalance = balanceAfterTransfer;

    await modalPo.transferToAddress({
      destinationAddress: encodeIcrcAccount(toAccount),
      amount,
    });

    await runResolvedPromises();

    expect(icrcLedgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
    expect(icrcLedgerApi.icrcTransfer).toHaveBeenCalledWith({
      identity: mockIdentity,
      canisterId: CKETH_LEDGER_CANISTER_ID,
      amount: amountE18s,
      to: toAccount,
      fee: mockCkETHToken.fee,
    });
    // Setup + Query + Update calls after transfer
    expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenCalledTimes(4);

    expect(await pagePo.getWalletPageHeadingPo().getTitle()).toBe("1.11 ckETH");
  });

  describe("unknown token redirection", () => {
    const unknownUniverseId = "aaaaa-aa";

    beforeEach(() => {
      // Mock the getTransactions call from the Tokens page.
      vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
        transactions: [],
        oldestTxId: undefined,
      } as icpIndexApi.GetTransactionsResponse);
    });

    it("redirect to tokens when unknown universe", async () => {
      page.mock({
        data: { universe: unknownUniverseId },
        routeId: AppPath.Wallet,
      });
      resetSnsProjects();
      importedTokensStore.set({
        importedTokens: [],
        certified: true,
      });

      expect(get(pageStore).path).toEqual(AppPath.Wallet);

      render(Wallet, {
        props: {
          accountIdentifier: undefined,
        },
      });
      await runResolvedPromises();
      expect(get(pageStore).path).toEqual(AppPath.Wallet);

      // Waits for the sns projects to be available
      setSnsProjects([{}]);
      await runResolvedPromises();

      expect(get(pageStore).path).toEqual(AppPath.Tokens);
    });

    it("waits for imported tokens being loaded before initiate the redirection", async () => {
      page.mock({
        data: { universe: unknownUniverseId },
        routeId: AppPath.Wallet,
      });
      setSnsProjects([{}]);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      expect(get(pageStore).path).toEqual(AppPath.Wallet);

      render(Wallet, {
        props: {
          accountIdentifier: undefined,
        },
      });
      await runResolvedPromises();
      expect(get(pageStore).path).toEqual(AppPath.Wallet);

      // Waits for the imported tokens to be available
      importedTokensStore.set({
        importedTokens: [],
        certified: true,
      });
      await runResolvedPromises();
      expect(get(pageStore).path).toEqual(AppPath.Tokens);
    });

    it("redirects to tokens for unknown universe when not signed in", async () => {
      setNoIdentity();
      page.mock({
        data: { universe: unknownUniverseId },
        routeId: AppPath.Wallet,
      });
      setSnsProjects([{}]);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      expect(get(pageStore).path).toEqual(AppPath.Wallet);

      render(Wallet, {
        props: {
          accountIdentifier: undefined,
        },
      });
      await runResolvedPromises();
      expect(get(pageStore).path).toEqual(AppPath.Tokens);
    });

    it("should not redirect on valid token", async () => {
      page.mock({
        data: { universe: importedTokenId.toText() },
        routeId: AppPath.Wallet,
      });
      setSnsProjects([{}]);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      expect(get(pageStore).path).toEqual(AppPath.Wallet);
      render(Wallet, {
        props: {
          accountIdentifier: undefined,
        },
      });
      await runResolvedPromises();

      importedTokensStore.set({
        importedTokens: [
          {
            ledgerCanisterId: importedTokenId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });
      await runResolvedPromises();

      expect(get(pageStore).path).toEqual(AppPath.Wallet);
    });

    it("should not redirect when a token becomes unknown during session", async () => {
      page.mock({
        data: { universe: importedTokenId.toText() },
        routeId: AppPath.Wallet,
      });
      setSnsProjects([{}]);
      importedTokensStore.set({
        importedTokens: [
          {
            ledgerCanisterId: importedTokenId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });

      expect(get(pageStore).path).toEqual(AppPath.Wallet);
      render(Wallet, {
        props: {
          accountIdentifier: undefined,
        },
      });
      await runResolvedPromises();

      expect(get(pageStore).path).toEqual(AppPath.Wallet);

      // Remove the imported token
      importedTokensStore.remove(importedTokenId);
      await runResolvedPromises();
      expect(get(pageStore).path).toEqual(AppPath.Wallet);
    });
  });
});
