/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { CONTEXT_PATH } from "../../../lib/constants/routes.constants";
import { snsProjectAccountsStore } from "../../../lib/derived/sns/sns-project-accounts.derived";
import SnsWallet from "../../../lib/pages/SnsWallet.svelte";
import { loadSnsAccounts } from "../../../lib/services/sns-accounts.services";
import { loadSnsTransactionFee } from "../../../lib/services/transaction-fees.services";
import { routeStore } from "../../../lib/stores/route.store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "../../mocks/sns-accounts.mock";

jest.mock("../../../lib/services/sns-accounts.services", () => {
  return {
    loadSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../../lib/services/transaction-fees.services", () => {
  return {
    loadSnsTransactionFee: jest.fn().mockResolvedValue(undefined),
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

      await waitFor(() => expect(loadSnsAccounts).toBeCalled());
      expect(loadSnsTransactionFee).toBeCalled();
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
  });
});
