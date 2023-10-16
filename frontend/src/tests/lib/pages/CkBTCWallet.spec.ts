import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKBTC_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/ckbtc.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
import * as services from "$lib/services/ckbtc-accounts.services";
import {
  ckBTCTransferTokens,
  syncCkBTCAccounts,
} from "$lib/services/ckbtc-accounts.services";
import * as transactionsServices from "$lib/services/ckbtc-transactions.services";
import { authStore } from "$lib/stores/auth.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { TransactionNetwork } from "$lib/types/transaction";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import CkBTCAccountsTest from "$tests/lib/components/accounts/CkBTCAccountsTest.svelte";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockUniversesTokens } from "$tests/mocks/tokens.mock";
import { selectSegmentBTC } from "$tests/utils/accounts.test-utils";
import { advanceTime } from "$tests/utils/timers.test-utils";
import { testTransferTokens } from "$tests/utils/transaction-modal.test-utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mockBTCAddressTestnet } from "../../mocks/ckbtc-accounts.mock";

const expectedBalanceAfterTransfer = 11_111n;

vi.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    syncCkBTCAccounts: vi.fn().mockResolvedValue(undefined),
    loadCkBTCAccounts: vi.fn().mockResolvedValue(undefined),
    ckBTCTransferTokens: vi.fn().mockImplementation(async () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [
            {
              ...mockCkBTCMainAccount,
              balanceE8s: expectedBalanceAfterTransfer,
            },
          ],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      return { blockIndex: 123n };
    }),
  };
});

vi.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadCkBTCAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/api/ckbtc-minter.api", () => {
  return {
    getBTCAddress: vi.fn().mockImplementation(() => mockBTCAddressTestnet),
  };
});

vi.mock("$lib/services/ckbtc-minter.services", async () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const actual = await vi.importActual<any>(
    "$lib/services/ckbtc-minter.services"
  );
  return {
    ...actual,
    updateBalance: vi.fn().mockResolvedValue([]),
    depositFee: vi.fn().mockResolvedValue(789n),
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

describe("CkBTCWallet", () => {
  const props = {
    accountIdentifier: mockCkBTCMainAccount.identifier,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe("accounts not loaded", () => {
    beforeEach(() => {
      icrcAccountsStore.reset();

      page.mock({
        data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    it("should render a spinner while loading", () => {
      const { getByTestId } = render(CkBTCWallet, props);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("should call to load ckBTC accounts", async () => {
      render(CkBTCWallet, props);

      await waitFor(() => expect(syncCkBTCAccounts).toBeCalled());
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date());

      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );

      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      tokensStore.setTokens(mockUniversesTokens);

      page.mock({
        data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    afterAll(() => vi.useRealTimers());

    it("should render ckTESTBTC name", async () => {
      const { getByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(
          getByTestId("universe-page-summary-component").textContent.trim()
        ).toBe("ckTESTBTC")
      );
    });

    it("should hide spinner when selected account is loaded", async () => {
      const { queryByTestId } = render(CkBTCWallet, props);

      await waitFor(() => expect(queryByTestId("spinner")).toBeNull());
    });

    it("should render `Main` as subtitle", async () => {
      const { queryByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(queryByTestId("wallet-page-heading-subtitle").textContent).toBe(
          "Main"
        )
      );
    });

    it("should render a balance with token", async () => {
      const { getByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(getByTestId("token-value-label")).not.toBeNull()
      );

      expect(getByTestId("token-value-label")?.textContent.trim()).toEqual(
        `${formatToken({
          value: mockCkBTCMainAccount.balanceE8s,
        })} ${mockCkBTCToken.symbol}`
      );
    });

    const modalProps = {
      ...props,
      testComponent: CkBTCWallet,
    };

    it("should open new transaction modal", async () => {
      const { queryByTestId, getByTestId } = render(CkBTCAccountsTest, {
        props: modalProps,
      });

      await waitFor(() =>
        expect(queryByTestId("open-ckbtc-transaction")).toBeInTheDocument()
      );

      const button = getByTestId("open-ckbtc-transaction") as HTMLButtonElement;
      await fireEvent.click(button);

      await waitFor(() => {
        expect(getByTestId("transaction-step-1")).toBeInTheDocument();
      });
    });

    it("should update account after transfer tokens", async () => {
      const result = render(CkBTCAccountsTest, { props: modalProps });

      const { queryByTestId, getByTestId } = result;

      // Check original sum
      await waitFor(() =>
        expect(
          queryByTestId("wallet-page-heading-component").querySelector(
            "[data-tid='token-value-label']"
          )?.textContent
        ).toBe("4'445'566.99 ckBTC")
      );

      // Make transfer
      await waitFor(() =>
        expect(queryByTestId("open-ckbtc-transaction")).toBeInTheDocument()
      );

      const button = getByTestId("open-ckbtc-transaction") as HTMLButtonElement;
      await fireEvent.click(button);

      await testTransferTokens({
        result,
        selectedNetwork: TransactionNetwork.ICP,
      });

      await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());

      // Account should have been updated and sum should be reflected
      await waitFor(() =>
        expect(
          queryByTestId("wallet-page-heading-component").querySelector(
            "[data-tid='token-value-label']"
          )?.textContent
        ).toContain(formatToken({ value: expectedBalanceAfterTransfer }))
      );
    });

    it("should reload transactions after transfer tokens", async () => {
      const result = render(CkBTCAccountsTest, { props: modalProps });

      expect(transactionsServices.loadCkBTCAccountTransactions).toBeCalledTimes(
        0
      );

      const { queryByTestId, getByTestId } = result;

      // Check original sum
      await waitFor(() =>
        expect(getByTestId("token-value")?.textContent ?? "").toEqual(
          `${formatToken({
            value: mockCkBTCMainAccount.balanceE8s,
          })}`
        )
      );

      // Make transfer
      await waitFor(() =>
        expect(queryByTestId("open-ckbtc-transaction")).toBeInTheDocument()
      );

      const button = getByTestId("open-ckbtc-transaction") as HTMLButtonElement;
      await fireEvent.click(button);

      await testTransferTokens({
        result,
        selectedNetwork: TransactionNetwork.ICP,
      });

      await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());

      await advanceTime(CKBTC_TRANSACTIONS_RELOAD_DELAY + 1000);

      await waitFor(() =>
        expect(
          transactionsServices.loadCkBTCAccountTransactions
        ).toBeCalledTimes(1)
      );
    });

    it("should open receive modal", async () => {
      const { getByTestId, container } = render(CkBTCAccountsTest, {
        props: modalProps,
      });

      await waitFor(() => expect(getByTestId("receive-ckbtc")).not.toBeNull());

      fireEvent.click(getByTestId("receive-ckbtc") as HTMLButtonElement);

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    });

    it("should reload on close receive modal", async () => {
      const { getByTestId, container } = render(CkBTCAccountsTest, {
        props: modalProps,
      });

      await waitFor(() => expect(getByTestId("receive-ckbtc")).not.toBeNull());

      fireEvent.click(getByTestId("receive-ckbtc") as HTMLButtonElement);

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );

      await selectSegmentBTC(container);

      const spy = vi.spyOn(services, "loadCkBTCAccounts");

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });
  });
});
