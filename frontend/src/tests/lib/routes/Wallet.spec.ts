import * as ckbtcMinterApi from "$lib/api/ckbtc-minter.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETH_LEDGER_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Wallet from "$lib/routes/Wallet.svelte";
import { authStore } from "$lib/stores/auth.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { mockSnsFullProject, principal } from "$tests/mocks/sns-projects.mock";
import { WalletPo } from "$tests/page-objects/Wallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/ckbtc-minter.api");

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

vi.mock("$lib/services/wallet-transactions.services", () => {
  return {
    loadWalletNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadWalletTransactions: vi.fn().mockResolvedValue(undefined),
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
  beforeEach(() => {
    setCkETHCanisters();
    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    setCkETHCanisters();
    icpAccountsStore.setForTesting(mockAccountsStoreData);
    overrideFeatureFlagsStore.reset();
    vi.spyOn(icrcLedgerApi, "icrcTransfer").mockResolvedValue(1234n);
    vi.mocked(ckbtcMinterApi.retrieveBtcStatusV2ByAccount).mockResolvedValue(
      []
    );
  });

  beforeAll(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
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
    });

    it("should render SnsWallet", async () => {
      const { getByTestId } = render(Wallet, {
        props: {
          accountIdentifier: principal(0).toText(),
        },
      });
      expect(getByTestId("sns-wallet")).toBeInTheDocument();
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

  // TODO: GIX-2150 Mock API layer instead of services for the setup
  it("user can transfer ckETH tokens and balance is refreshed", async () => {
    const amount = 2;
    const E18S_PER_TOKEN = 10n ** 18n;
    const amountE18s = BigInt(amount) * E18S_PER_TOKEN;
    const balanceAfterTransfer = 1110000000000000000n;
    const balanceBeforeTransfer = balanceAfterTransfer + amountE18s;

    overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", true);

    // Called only after a transfer (for now GIX-2150)
    vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
      balanceAfterTransfer
    );

    page.mock({
      data: { universe: CKETH_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });

    icrcAccountsStore.set({
      universeId: CKETH_UNIVERSE_CANISTER_ID,
      accounts: {
        accounts: [
          {
            ...mockIcrcMainAccount,
            balanceUlps: balanceBeforeTransfer,
          },
        ],
        certified: true,
      },
    });

    tokensStore.setToken({
      canisterId: CKETH_UNIVERSE_CANISTER_ID,
      token: mockCkETHToken,
      certified: true,
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

    expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenCalledTimes(0);

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
    // Query + Update calls
    expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenCalledTimes(2);

    expect(await pagePo.getWalletPageHeadingPo().getTitle()).toBe("1.11 ckETH");
  });
});
