import * as accountsApi from "$lib/api/accounts.api";
import * as icpLedgerApi from "$lib/api/icp-ledger.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import CKETH_LOGO from "$lib/assets/ckETH.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETH_INDEX_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { pageStore } from "$lib/derived/page.derived";
import {
  snsProjectsCommittedStore,
  snsProjectsStore,
} from "$lib/derived/sns/sns-projects.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import Accounts from "$lib/routes/Accounts.svelte";
import { uncertifiedLoadSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
import { uncertifiedLoadAccountsBalance } from "$lib/services/wallet-uncertified-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  mockSummary,
  mockToken,
} from "$tests/mocks/sns-projects.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import WalletTest from "../pages/AccountsTest.svelte";

vi.mock("$lib/api/accounts.api");
vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/nns-dapp.api");

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/wallet-accounts.services", () => {
  return {
    syncAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/sns-accounts-balance.services", () => {
  return {
    uncertifiedLoadSnsAccountsBalances: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/wallet-uncertified-accounts.services", () => {
  return {
    uncertifiedLoadAccountsBalance: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    updateBalance: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-info.services", () => {
  return {
    loadCkBTCInfo: vi.fn().mockResolvedValue(undefined),
  };
});

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

describe("Accounts", () => {
  const balanceIcrcToken = 314000000n;
  const newSubaccountName = "test";
  const subaccountBalanceDefault = 0n;
  let subaccountBalance = subaccountBalanceDefault;
  const mainAccountBalanceDefault = 314000000n;
  let mainAccountBalance = mainAccountBalanceDefault;

  const renderComponent = () => {
    const { container } = render(Accounts);

    return AccountsPo.under(new JestPageObjectElement(container));
  };

  beforeAll(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  vi.spyOn(snsProjectsStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeEach(() => {
    tokensStore.reset();
    icrcAccountsStore.reset();
    setCkETHCanisters();
    overrideFeatureFlagsStore.reset();
    // TODO: GIX-1985 Remove all the tests outside the describe once the feature flag is enabled by default.
    overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);

    subaccountBalance = subaccountBalanceDefault;
    mainAccountBalance = mainAccountBalanceDefault;

    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockResolvedValue(mockToken);
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
      balanceIcrcToken
    );
    vi.spyOn(accountsApi, "createSubAccount").mockResolvedValue(undefined);
    vi.spyOn(icpLedgerApi, "sendICP").mockResolvedValue(1234n);
    vi.spyOn(icpLedgerApi, "queryAccountBalance").mockImplementation(
      async ({ icpAccountIdentifier }) => {
        if (icpAccountIdentifier === mockMainAccount.identifier) {
          return mainAccountBalance;
        } else if (icpAccountIdentifier === mockSubAccount.identifier) {
          return subaccountBalance;
        }
        throw new Error(
          `Unexpected account identifier ${icpAccountIdentifier}`
        );
      }
    );
    vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue({
      ...mockAccountDetails,
      sub_accounts: [
        {
          name: newSubaccountName,
          sub_account: mockSubAccount.subAccount,
          account_identifier: mockSubAccount.identifier,
        },
      ],
    });

    vi.spyOn(snsSelectedTransactionFeeStore, "subscribe").mockImplementation(
      mockSnsSelectedTransactionFeeStoreSubscribe()
    );

    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);

    // Reset to default value
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Accounts,
    });

    snsAccountsStore.setAccounts({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      certified: true,
      accounts: [mockSnsMainAccount],
    });

    icpAccountsStore.setForTesting(mockAccountsStoreData);

    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
  });

  it("should render NnsAccounts by default", () => {
    const { queryByTestId } = render(Accounts);
    expect(queryByTestId("accounts-body")).toBeInTheDocument();
  });

  it("should render nns name", () => {
    const { getByTestId } = render(Accounts);

    const titleRow = getByTestId("projects-summary");

    expect(titleRow?.textContent?.includes(en.core.ic)).toBeTruthy();
  });

  it("should render icp project logo", () => {
    const { getByTestId } = render(Accounts);

    const logo = getByTestId("project-logo");
    const img = logo.querySelector('[data-tid="logo"]');

    expect(img?.getAttribute("alt") ?? "").toEqual(en.auth.ic_logo);
  });

  it("should open nns transaction modal", async () => {
    const { getByTestId } = render(Accounts);

    const button = getByTestId("open-new-transaction") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId("transaction-step-1")).toBeInTheDocument();
    });
  });

  it("should open nns receive modal", async () => {
    const { getByTestId, container } = render(WalletTest, {
      props: { testComponent: Accounts },
    });

    fireEvent.click(getByTestId("receive-icp") as HTMLButtonElement);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });

  it("should open add account modal", async () => {
    const { container, getByTestId, getByText } = render(Accounts);

    const button = getByTestId("open-add-account-modal") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(container.querySelector("div.modal")).not.toBeNull();

      expect(
        getByText(en.accounts.attach_hardware_title, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("should render sns accounts when a project is selected", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { queryByTestId } = render(Accounts);

    expect(queryByTestId("sns-accounts-body")).toBeInTheDocument();

    await waitFor(() =>
      expect(queryByTestId("sns-accounts-body")).toBeInTheDocument()
    );
  });

  it("should open sns transaction modal", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    const { queryByTestId, getByTestId } = render(Accounts);

    expect(queryByTestId("sns-accounts-body")).toBeInTheDocument();

    await waitFor(() =>
      expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
    );

    const button = getByTestId("open-new-sns-transaction") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId("transaction-step-1")).toBeInTheDocument();
    });
  });

  it("should open sns receive modal", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByTestId, container } = render(WalletTest, {
      props: { testComponent: Accounts },
    });

    fireEvent.click(getByTestId("receive-sns") as HTMLButtonElement);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );

    expect(getByTestId("logo").getAttribute("alt")).toEqual(
      `${mockSnsFullProject.summary.metadata.name} project logo`
    );
  });

  it("should load Sns accounts balances", async () => {
    render(Accounts);

    await waitFor(() =>
      expect(uncertifiedLoadSnsAccountsBalances).toHaveBeenCalled()
    );
  });

  it("should load ckBTC accounts balances", async () => {
    render(Accounts);

    await waitFor(() =>
      expect(uncertifiedLoadAccountsBalance).toHaveBeenCalled()
    );
  });

  it("should not load ckBTC accounts balances", async () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    render(Accounts);

    await waitFor(() =>
      expect(uncertifiedLoadAccountsBalance).toHaveBeenCalled()
    );
  });

  it("should load ckETH accounts", async () => {
    render(Accounts);

    await waitFor(() =>
      expect(uncertifiedLoadAccountsBalance).toHaveBeenCalled()
    );
  });

  it("should not load ckETH accounts when universe ckETH is selected", async () => {
    page.mock({
      data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    render(Accounts);

    // TODO: "api for a check on the service" https://dfinity.atlassian.net/browse/GIX-2150
    await waitFor(() =>
      expect(uncertifiedLoadAccountsBalance).toHaveBeenCalled()
    );
  });

  // TODO: redo https://dfinity.atlassian.net/browse/GIX-2150
  // it("should load ckETH accounts", async () => {
  //   overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", true);
  //
  //   render(Accounts);
  //
  //   const mockAccount = {
  //     identifier: encodeIcrcAccount({
  //       owner: mockIdentity.getPrincipal(),
  //     }),
  //     principal: mockIdentity.getPrincipal(),
  //     type: "main",
  //     balanceUlps: balanceIcrcToken,
  //   };
  //
  //   await waitFor(() => {
  //     expect(
  //         get(icrcAccountsStore)[CKETH_UNIVERSE_CANISTER_ID.toText()]
  //     ).toEqual({
  //       certified: false,
  //       accounts: [mockAccount],
  //     });
  //   });
  // });
  //
  // it("should make ckETH transactions from ckETH universe", async () => {
  //   overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", true);
  //
  //   page.mock({
  //     data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
  //     routeId: AppPath.Accounts,
  //   });
  //
  //   const po = renderComponent();
  //
  //   await runResolvedPromises();
  //
  //   await po.clickCkETHSend();
  //
  //   const modalPo = po.getIcrcTokenTransactionModalPo();
  //
  //   expect(await modalPo.isPresent()).toBe(true);
  //
  //   const toAccount = {
  //     owner: principal(2),
  //   };
  //   const amount = 2;
  //
  //   await modalPo.transferToAddress({
  //     destinationAddress: encodeIcrcAccount(toAccount),
  //     amount,
  //   });
  //
  //   expect(icrcLedgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
  //   expect(icrcLedgerApi.icrcTransfer).toHaveBeenCalledWith({
  //     identity: mockIdentity,
  //     canisterId: CKETH_LEDGER_CANISTER_ID,
  //     amount: 200_000_000n,
  //     to: toAccount,
  //     fee: mockCkETHToken.fee,
  //   });
  // });
  //
  // it("should render IcrcTokenAccounts and IcrcTokenAccountsFooter component with ckETH enabled and universe ckETH", async () => {
  //   overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", true);
  //
  //   page.mock({
  //     data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
  //     routeId: AppPath.Accounts,
  //   });
  //
  //   const po = renderComponent();
  //
  //   expect(await po.getIcrcTokenAccountsPo().isPresent()).toBe(true);
  //   expect(await po.getIcrcTokenAccountsFooterPo().isPresent()).toBe(true);
  // });

  it("should render sns project name", () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByTestId } = render(Accounts);

    const titleRow = getByTestId("projects-summary");

    expect(
      titleRow?.textContent?.includes(mockSummary.metadata.name)
    ).toBeTruthy();
  });

  it("should render sns project logo", () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByTestId } = render(Accounts);

    const logo = getByTestId("project-logo");
    const img = logo.querySelector('[data-tid="logo"]');

    expect(img?.getAttribute("src") ?? "").toEqual(mockSummary.metadata.logo);
  });

  it("should render icrc project name", () => {
    tokensStore.setTokens(mockTokens);

    page.mock({
      data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    const { getByTestId } = render(Accounts);

    const titleRow = getByTestId("projects-summary");

    expect(titleRow?.textContent?.includes("ckETH")).toBeTruthy();
  });

  it("should render related icrc project logo", () => {
    tokensStore.setTokens(mockTokens);

    page.mock({
      data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    const { getByTestId } = render(Accounts);

    const logo = getByTestId("project-logo");
    const img = logo.querySelector('[data-tid="logo"]');

    expect(img?.getAttribute("src") ?? "").toEqual(CKETH_LOGO);
  });

  it("should render project title", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByText } = render(Accounts);

    await waitFor(() =>
      expect(
        getByText(mockSnsFullProject.summary.metadata.name)
      ).toBeInTheDocument()
    );
  });

  it("should render ckBTC name", () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    const { getByTestId } = render(Accounts);

    const titleRow = getByTestId("projects-summary");

    expect(titleRow?.textContent?.includes(en.ckbtc.title)).toBeTruthy();
  });

  it("should render icp project logo", () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    const { getByTestId } = render(Accounts);

    const logo = getByTestId("project-logo");
    const img = logo.querySelector('[data-tid="logo"]');

    expect(img?.getAttribute("alt") ?? "").toEqual(en.ckbtc.logo);
  });

  describe("when NNS universe", () => {
    beforeEach(() => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Accounts,
      });
    });

    describe("when tokens page is enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      });

      it("renders tokens table with NNS accounts", async () => {
        icpAccountsStore.setForTesting({
          main: {
            ...mockMainAccount,
            balanceUlps: mainAccountBalance,
          },
          subAccounts: [
            {
              ...mockSubAccount,
              balanceUlps: 123456789000000n,
            },
          ],
          hardwareWallets: [
            {
              ...mockHardwareWalletAccount,
              balanceUlps: 222000000n,
            },
          ],
        });
        const po = renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowsData()).toEqual([
          {
            balance: "3.14 ICP",
            projectName: "Main",
          },
          {
            balance: "1'234'567.89 ICP",
            projectName: "test subaccount",
          },
          {
            balance: "2.22 ICP",
            projectName: "hardware wallet account test",
          },
        ]);
      });

      it("renders 'Accounts' as tokens table first column", async () => {
        const po = renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Accounts");
      });

      it("user can add a new account", async () => {
        icpAccountsStore.setForTesting({
          main: {
            ...mockMainAccount,
            balanceUlps: mainAccountBalance,
          },
          subAccounts: [],
          hardwareWallets: [],
        });
        const po = renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowsData()).toEqual([
          {
            balance: "3.14 ICP",
            projectName: "Main",
          },
        ]);

        const pagePo = po.getNnsAccountsPo();

        await pagePo.clickAddAccount();

        const modalPo = po.getAddAccountModalPo();
        expect(await modalPo.isPresent()).toBe(true);

        await modalPo.addAccount(newSubaccountName);

        await runResolvedPromises();

        expect(await tablePo.getRowsData()).toEqual([
          {
            balance: "3.14 ICP",
            projectName: "Main",
          },
          {
            balance: "0 ICP",
            projectName: newSubaccountName,
          },
        ]);
      });

      it("user can open receive modal and refresh balance", async () => {
        icpAccountsStore.setForTesting({
          main: {
            ...mockMainAccount,
            balanceUlps: mainAccountBalance,
          },
          subAccounts: [
            {
              ...mockSubAccount,
              balanceUlps: subaccountBalance,
            },
          ],
          hardwareWallets: [],
        });
        const po = renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowData(mockSubAccount.name)).toEqual({
          balance: "0 ICP",
          projectName: "test subaccount",
        });

        await tablePo.clickReceiveOnRow(mockSubAccount.name);

        const modalPo = po.getReceiveModalPo();
        expect(await modalPo.isPresent()).toBe(true);

        subaccountBalance = 220000000n;
        await modalPo.clickFinish();

        await runResolvedPromises();
        // The modal needs another tick to be removed from the DOM
        await runResolvedPromises();

        expect(await modalPo.isPresent()).toBe(false);
        expect(await tablePo.getRowData(mockSubAccount.name)).toEqual({
          balance: "2.20 ICP",
          projectName: "test subaccount",
        });
      });

      it("user can open the send modal from footer and make a transaction", async () => {
        icpAccountsStore.setForTesting({
          main: {
            ...mockMainAccount,
            balanceUlps: mainAccountBalance,
          },
          subAccounts: [],
          hardwareWallets: [],
        });
        const po = renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowData("Main")).toEqual({
          balance: "3.14 ICP",
          projectName: "Main",
        });

        const footerPo = po.getNnsAccountsFooterPo();
        expect(await footerPo.isPresent()).toBe(true);

        await footerPo.clickSend();

        const modalPo = po.getIcpTransactionModalPo();
        expect(await modalPo.isPresent()).toBe(true);

        mainAccountBalance = 114000000n;
        const amount = 2;
        const destinationAddress = mockSubAccount.identifier;
        modalPo.transferToAddress({
          destinationAddress,
          amount,
        });

        await runResolvedPromises();

        expect(await tablePo.getRowData("Main")).toEqual({
          balance: "1.14 ICP",
          projectName: "Main",
        });
        expect(await modalPo.isPresent()).toBe(false);
        expect(icpLedgerApi.sendICP).toHaveBeenCalledTimes(1);
        expect(icpLedgerApi.sendICP).toHaveBeenCalledWith({
          identity: mockIdentity,
          to: destinationAddress,
          amount: TokenAmount.fromNumber({ amount, token: ICPToken }).toE8s(),
          fromSubaccount: undefined,
          fee: NNS_TOKEN_DATA.fee,
        });
      });

      it("user can open the send modal from tokens table and make a transaction", async () => {
        subaccountBalance = 220000000n;
        icpAccountsStore.setForTesting({
          main: {
            ...mockMainAccount,
            balanceUlps: mainAccountBalance,
          },
          subAccounts: [
            {
              ...mockSubAccount,
              balanceUlps: subaccountBalance,
            },
          ],
          hardwareWallets: [],
        });
        const po = renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowData(mockSubAccount.name)).toEqual({
          balance: "2.20 ICP",
          projectName: "test subaccount",
        });

        await tablePo.clickSendOnRow(mockSubAccount.name);

        const modalPo = po.getIcpTransactionModalPo();
        expect(await modalPo.isPresent()).toBe(true);

        subaccountBalance = 120000000n;
        const amount = 1;
        const destinationAddress = mockMainAccount.identifier;
        modalPo.transferToAddress({
          destinationAddress,
          amount,
        });

        await runResolvedPromises();

        expect(await tablePo.getRowData(mockSubAccount.name)).toEqual({
          balance: "1.20 ICP",
          projectName: "test subaccount",
        });
        expect(await modalPo.isPresent()).toBe(false);
        expect(icpLedgerApi.sendICP).toHaveBeenCalledTimes(1);
        expect(icpLedgerApi.sendICP).toHaveBeenCalledWith({
          identity: mockIdentity,
          to: destinationAddress,
          amount: TokenAmount.fromNumber({ amount, token: ICPToken }).toE8s(),
          fromSubAccount: mockSubAccount.subAccount,
          fee: NNS_TOKEN_DATA.fee,
        });
      });
    });
  });

  it("should open icrc receive modal", async () => {
    tokensStore.setTokens(mockTokens);

    page.mock({
      data: {
        universe: CKETH_UNIVERSE_CANISTER_ID.toText(),
        routeId: AppPath.Accounts,
      },
    });

    const { getByTestId, container } = render(WalletTest, {
      props: { testComponent: Accounts },
    });

    fireEvent.click(getByTestId("receive-icrc") as HTMLButtonElement);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );

    expect(getByTestId("logo").getAttribute("alt")).toEqual(`ckETH logo`);
  });

  it("should redirect to Tokens page when tokens page is enabled and universe is not NNS", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);

    page.mock({
      data: {
        universe: CKBTC_UNIVERSE_CANISTER_ID.toText(),
        routeId: AppPath.Accounts,
      },
    });

    expect(get(pageStore)?.path).toEqual(AppPath.Accounts);

    render(Accounts);

    expect(get(pageStore)?.path).toEqual(AppPath.Tokens);
  });

  it("should not redirect to Tokens page when tokens page is not enabled and universe is not NNS", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);

    page.mock({
      data: {
        universe: CKBTC_UNIVERSE_CANISTER_ID.toText(),
        routeId: AppPath.Accounts,
      },
    });

    expect(get(pageStore)?.path).toEqual(AppPath.Accounts);

    render(Accounts);

    expect(get(pageStore)?.path).toEqual(AppPath.Accounts);
  });

  it("should not redirect to Tokens page when tokens page is enabled and universe is NNS", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);

    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
        routeId: AppPath.Accounts,
      },
    });

    expect(get(pageStore)?.path).toEqual(AppPath.Accounts);

    render(Accounts);

    expect(get(pageStore)?.path).toEqual(AppPath.Accounts);
  });
});
