/**
 * @jest-environment jsdom
 */

import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
import {
  ckBTCTransferTokens,
  syncCkBTCAccounts,
} from "$lib/services/ckbtc-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { TokenAmount } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { TransactionNetwork } from "$lib/types/transaction";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "../../mocks/ckbtc-accounts.mock";
import en from "../../mocks/i18n.mock";
import { mockUniversesTokens } from "../../mocks/tokens.mock";
import { testTransferTokens } from "../../utils/transaction-modal.test.utils";

const expectedBalanceAfterTransfer = TokenAmount.fromE8s({
  amount: BigInt(11_111),
  token: mockCkBTCToken,
});

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    syncCkBTCAccounts: jest.fn().mockResolvedValue(undefined),
    ckBTCTransferTokens: jest.fn().mockImplementation(async () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [
            {
              ...mockCkBTCMainAccount,
              balance: expectedBalanceAfterTransfer,
            },
          ],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      return { success: true };
    }),
  };
});

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: jest.fn().mockResolvedValue(undefined),
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

    it("should open new transaction modal", async () => {
      const { queryByTestId, getByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(queryByTestId("open-new-ckbtc-transaction")).toBeInTheDocument()
      );

      const button = getByTestId(
        "open-new-ckbtc-transaction"
      ) as HTMLButtonElement;
      await fireEvent.click(button);

      await waitFor(() => {
        expect(getByTestId("transaction-step-1")).toBeInTheDocument();
      });
    });

    it("should update account after transfer tokens", async () => {
      const result = render(CkBTCWallet, props);

      const { queryByTestId, getByTestId } = result;

      // Check original sum
      await waitFor(() =>
        expect(getByTestId("token-value")?.textContent ?? "").toEqual(
          `${formatToken({ value: mockCkBTCMainAccount.balance.toE8s() })}`
        )
      );

      // Make transfer
      await waitFor(() =>
        expect(queryByTestId("open-new-ckbtc-transaction")).toBeInTheDocument()
      );

      const button = getByTestId(
        "open-new-ckbtc-transaction"
      ) as HTMLButtonElement;
      await fireEvent.click(button);

      await testTransferTokens({
        result,
        selectedNetwork: TransactionNetwork.ICP_CKBTC,
      });

      await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());

      // Account should have been updated and sum should be reflected
      await waitFor(() =>
        expect(getByTestId("token-value")?.textContent ?? "").toEqual(
          `${formatToken({ value: expectedBalanceAfterTransfer.toE8s() })}`
        )
      );
    });
  });
});
