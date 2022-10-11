/**
 * @jest-environment jsdom
 */

import { CONTEXT_PATH } from "$lib/constants/routes.constants";
import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
import SnsWallet from "$lib/pages/SnsWallet.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { routeStore } from "$lib/stores/route.store";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "../../mocks/sns-accounts.mock";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SnsWallet", () => {
  describe("accounts not loaded", () => {
    beforeEach(() => {
      jest
        .spyOn(snsProjectAccountsStore, "subscribe")
        .mockImplementation(mockSnsAccountsStoreSubscribe([]));
      // Context needs to match the mocked sns accounts
      routeStore.update({
        path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/accounts`,
      });
    });
    it("should render a spinner while loading", () => {
      const { getByTestId } = render(SnsWallet);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("should call to load sns accounts and transaction fee", async () => {
      render(SnsWallet);

      await waitFor(() => expect(syncSnsAccounts).toBeCalled());
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      jest
        .spyOn(snsProjectAccountsStore, "subscribe")
        .mockImplementation(
          mockSnsAccountsStoreSubscribe([mockSnsMainAccount])
        );
      // Context and identifier needs to match the mocked sns accounts
      routeStore.update({
        path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/wallet/${
          mockSnsMainAccount.identifier
        }`,
      });
    });

    afterAll(() => jest.clearAllMocks());

    it("should hide spinner when selected account is loaded", async () => {
      const { queryByTestId } = render(SnsWallet);

      await waitFor(() => expect(queryByTestId("spinner")).toBeNull());
    });

    it("should render wallet summary", async () => {
      const { queryByTestId } = render(SnsWallet);

      await waitFor(() =>
        expect(queryByTestId("wallet-summary")).toBeInTheDocument()
      );
    });

    it("should open new transaction modal", async () => {
      const { queryByTestId, getByTestId } = render(SnsWallet);

      await waitFor(() =>
        expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
      );

      const button = getByTestId(
        "open-new-sns-transaction"
      ) as HTMLButtonElement;
      await fireEvent.click(button);

      await waitFor(() => {
        expect(getByTestId("transaction-step-1")).toBeInTheDocument();
      });
    });
  });
});
