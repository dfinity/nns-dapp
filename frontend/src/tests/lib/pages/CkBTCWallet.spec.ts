/**
 * @jest-environment jsdom
 */

import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
import * as services from "$lib/services/ckbtc-accounts.services";
import {
  ckBTCTransferTokens,
  syncCkBTCAccounts,
} from "$lib/services/ckbtc-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { TransactionNetwork } from "$lib/types/transaction";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { mockUniversesTokens } from "$tests/mocks/tokens.mock";
import { selectSegmentBTC } from "$tests/utils/accounts.test-utils";
import { testTransferTokens } from "$tests/utils/transaction-modal.test.utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mockBTCAddressTestnet } from "../../mocks/ckbtc-accounts.mock";
import CkBTCAccountsTest from "../components/accounts/CkBTCAccountsTest.svelte";

const expectedBalanceAfterTransfer = 11_111n;

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    syncCkBTCAccounts: jest.fn().mockResolvedValue(undefined),
    loadCkBTCAccounts: jest.fn().mockResolvedValue(undefined),
    ckBTCTransferTokens: jest.fn().mockImplementation(async () => {
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

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: jest.fn().mockResolvedValue(undefined),
    loadCkBTCAccountTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/api/ckbtc-minter.api", () => {
  return {
    getBTCAddress: jest.fn().mockImplementation(() => mockBTCAddressTestnet),
  };
});

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    ...jest.requireActual("$lib/services/ckbtc-minter.services"),
    updateBalance: jest.fn().mockResolvedValue([]),
    depositFee: jest.fn().mockResolvedValue(789n),
  };
});

describe("CkBTCWallet", () => {
  const props = {
    accountIdentifier: mockCkBTCMainAccount.identifier,
  };

  describe("accounts not loaded", () => {
    beforeAll(() => {
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
    beforeAll(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);

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

    afterAll(() => jest.clearAllMocks());

    it("should render ckTESTBTC name", async () => {
      const { getByTestId } = render(CkBTCWallet, props);

      await waitFor(() => {
        const titleRow = getByTestId("projects-summary");
        expect(titleRow).not.toBeNull();
        expect(
          titleRow?.textContent?.includes(en.ckbtc.test_title)
        ).toBeTruthy();
      });
    });

    it("should hide spinner when selected account is loaded", async () => {
      const { queryByTestId } = render(CkBTCWallet, props);

      await waitFor(() => expect(queryByTestId("spinner")).toBeNull());
    });

    it("should render wallet summary", async () => {
      const { queryByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(queryByTestId("wallet-summary")).toBeInTheDocument()
      );
    });

    it("should render a detailed balance in summary", async () => {
      const { queryByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(queryByTestId("wallet-summary")).toBeInTheDocument()
      );

      const icp: HTMLSpanElement | null = queryByTestId("token-value");

      expect(icp?.innerHTML).toEqual(
        `${formatToken({
          value: mockCkBTCMainAccount.balanceE8s,
          detailed: true,
        })}`
      );
    });

    it("should render a balance with token in summary", async () => {
      const { getByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(getByTestId("token-value-label")).not.toBeNull()
      );

      expect(getByTestId("token-value-label")?.textContent.trim()).toEqual(
        `${formatToken({
          value: mockCkBTCMainAccount.balanceE8s,
          detailed: true,
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
        expect(getByTestId("token-value")?.textContent ?? "").toEqual(
          `${formatToken({
            value: mockCkBTCMainAccount.balanceE8s,
            detailed: true,
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

      // Account should have been updated and sum should be reflected
      await waitFor(() =>
        expect(getByTestId("token-value")?.textContent ?? "").toEqual(
          `${formatToken({ value: expectedBalanceAfterTransfer })}`
        )
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

      const spy = jest.spyOn(services, "syncCkBTCAccounts");

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });
  });
});
