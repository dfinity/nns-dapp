import * as accountsApi from "$lib/api/accounts.api";
import * as icpLedgerApi from "$lib/api/icp-ledger.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
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
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockHardwareWalletAccountDetails,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  mockToken,
} from "$tests/mocks/sns-projects.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

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
  const subaccountName = "test";
  const subaccountDetails = {
    name: subaccountName,
    sub_account: mockSubAccount.subAccount,
    account_identifier: mockSubAccount.identifier,
  };
  const subaccountBalanceDefault = 0n;
  let subaccountBalance = subaccountBalanceDefault;
  const mainAccountBalanceDefault = 314000000n;
  let mainAccountBalance = mainAccountBalanceDefault;
  const hardwareWalletBalanceDefault = 220000000n;
  let hardwareWalletBalance = hardwareWalletBalanceDefault;

  const renderComponent = async () => {
    const { container } = render(Accounts);

    await runResolvedPromises();

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
    hardwareWalletBalance = hardwareWalletBalanceDefault;

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
        } else if (
          icpAccountIdentifier === mockHardwareWalletAccount.identifier
        ) {
          return hardwareWalletBalance;
        }
        throw new Error(
          `Unexpected account identifier ${icpAccountIdentifier}`
        );
      }
    );
    vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(async () => {
      return mockAccountDetails;
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

  describe("when NNS universe", () => {
    beforeEach(() => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Accounts,
      });
      icpAccountsStore.resetForTesting();
    });

    describe("when tokens page is enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      });

      it("renders tokens table with NNS accounts", async () => {
        hardwareWalletBalance = 222000000n;
        subaccountBalance = 123456789000000n;
        vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(async () => {
          return {
            ...mockAccountDetails,
            sub_accounts: [subaccountDetails],
            hardware_wallet_accounts: [mockHardwareWalletAccountDetails],
          };
        });
        const po = await renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowsData()).toEqual([
          {
            balance: "3.14 ICP",
            projectName: "Main",
          },
          {
            balance: "1'234'567.89 ICP",
            projectName: subaccountName,
          },
          {
            balance: "2.22 ICP",
            projectName: mockHardwareWalletAccountDetails.name,
          },
        ]);
      });

      it("renders 'Accounts' as tokens table first column", async () => {
        const po = await renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Accounts");
      });

      it("user can add a new account", async () => {
        let hasSubaccount = false;
        vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(async () => {
          if (hasSubaccount) {
            return {
              ...mockAccountDetails,
              sub_accounts: [subaccountDetails],
            };
          }
          return {
            ...mockAccountDetails,
          };
        });

        const po = await renderComponent();

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

        hasSubaccount = true;

        await modalPo.addAccount(subaccountName);

        await runResolvedPromises();

        expect(await tablePo.getRowsData()).toEqual([
          {
            balance: "3.14 ICP",
            projectName: "Main",
          },
          {
            balance: "0 ICP",
            projectName: subaccountName,
          },
        ]);
      });

      it("user can open receive modal and refresh balance", async () => {
        vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(async () => {
          return {
            ...mockAccountDetails,
            sub_accounts: [subaccountDetails],
          };
        });
        const po = await renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowData(subaccountName)).toEqual({
          balance: "0 ICP",
          projectName: subaccountName,
        });

        await tablePo.clickReceiveOnRow(subaccountName);

        const modalPo = po.getReceiveModalPo();
        expect(await modalPo.isPresent()).toBe(true);

        subaccountBalance = 220000000n;
        await modalPo.clickFinish();

        await runResolvedPromises();
        // The modal needs another tick to be removed from the DOM
        await runResolvedPromises();

        expect(await modalPo.isPresent()).toBe(false);
        expect(await tablePo.getRowData(subaccountName)).toEqual({
          balance: "2.20 ICP",
          projectName: subaccountName,
        });
      });

      it("user can open the send modal from footer and make a transaction", async () => {
        const po = await renderComponent();

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
        vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(async () => {
          return {
            ...mockAccountDetails,
            sub_accounts: [subaccountDetails],
          };
        });
        const po = await renderComponent();

        const tablePo = po.getNnsAccountsPo().getTokensTablePo();
        expect(await tablePo.getRowData(subaccountName)).toEqual({
          balance: "2.20 ICP",
          projectName: subaccountName,
        });

        await tablePo.clickSendOnRow(subaccountName);

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

        expect(await tablePo.getRowData(subaccountName)).toEqual({
          balance: "1.20 ICP",
          projectName: subaccountName,
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

  it("should redirect to Tokens page when tokens page is enabled and universe is not NNS", async () => {
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
