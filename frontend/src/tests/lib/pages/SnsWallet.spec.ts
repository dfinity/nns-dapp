/**
 * @jest-environment jsdom
 */

import SnsWallet from "$lib/pages/SnsWallet.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { page } from "$mocks/$app/stores";
import { Principal } from "@dfinity/principal";
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
  const props = {
    accountIdentifier: mockSnsMainAccount.identifier,
  };

  describe("accounts not loaded", () => {
    beforeEach(() => {
      // Load accounts in a different project
      jest
        .spyOn(snsAccountsStore, "subscribe")
        .mockImplementation(
          mockSnsAccountsStoreSubscribe(Principal.fromText("aaaaa-aa"))
        );

      page.mock({ data: { universe: mockPrincipal.toText() } });
    });
    it("should render a spinner while loading", () => {
      const { getByTestId } = render(SnsWallet, props);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("should call to load sns accounts and transaction fee", async () => {
      render(SnsWallet, props);

      await waitFor(() => expect(syncSnsAccounts).toBeCalled());
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      jest
        .spyOn(snsAccountsStore, "subscribe")
        .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));
    });

    afterAll(() => jest.clearAllMocks());

    it("should hide spinner when selected account is loaded", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await waitFor(() => expect(queryByTestId("spinner")).toBeNull());
    });

    it("should render wallet summary", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await waitFor(() =>
        expect(queryByTestId("wallet-summary")).toBeInTheDocument()
      );
    });

    it("should open new transaction modal", async () => {
      const { queryByTestId, getByTestId } = render(SnsWallet, props);

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
