/**
 * @jest-environment jsdom
 */

import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import SnsWallet from "$lib/pages/SnsWallet.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import * as services from "$lib/services/sns-transactions.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "$tests/mocks/sns-accounts.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import {
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";
import en from "../../mocks/i18n.mock";
import { waitModalIntroEnd } from "../../mocks/modal.mock";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/sns-transactions.services", () => {
  return {
    loadSnsAccountNextTransactions: jest.fn().mockResolvedValue(undefined),
    loadSnsAccountTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SnsWallet", () => {
  const props = {
    accountIdentifier: mockSnsMainAccount.identifier,
  };

  beforeEach(() => {
    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponseFor({
        principal: mockPrincipal,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
  });

  describe("accounts not loaded", () => {
    beforeEach(() => {
      // Load accounts in a different project
      jest
        .spyOn(snsAccountsStore, "subscribe")
        .mockImplementation(
          mockSnsAccountsStoreSubscribe(Principal.fromText("aaaaa-aa"))
        );
      jest
        .spyOn(snsSelectedTransactionFeeStore, "subscribe")
        .mockImplementation(mockSnsSelectedTransactionFeeStoreSubscribe());

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

    it("should render sns project name", async () => {
      const { getByTestId } = render(SnsWallet, props);

      const titleRow = getByTestId("projects-summary");

      expect(titleRow).not.toBeNull();
    });

    it("should hide spinner when selected account is loaded", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await waitFor(() => expect(queryByTestId("spinner")).toBeNull());
    });

    it("should render wallet summary and transactions", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await waitFor(() =>
        expect(queryByTestId("wallet-summary")).toBeInTheDocument()
      );
      await waitFor(() =>
        expect(queryByTestId("transactions-list")).toBeInTheDocument()
      );
    });

    const testModal = async ({
      result,
      testId,
    }: {
      result: RenderResult<SvelteComponent>;
      testId: string;
    }) => {
      const { container, getByTestId } = result;

      const button = getByTestId(testId) as HTMLButtonElement;
      await fireEvent.click(button);

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    };

    it("should open new transaction modal", async () => {
      const result = render(SnsWallet, props);

      const { queryByTestId, getByTestId } = result;

      await waitFor(() =>
        expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
      );

      await testModal({ result, testId: "open-new-sns-transaction" });

      await waitFor(() => {
        expect(getByTestId("transaction-step-1")).toBeInTheDocument();
      });
    });

    it("should open receive modal", async () => {
      const result = render(SnsWallet, props);

      await testModal({ result, testId: "receive-sns" });

      const { getByTestId } = result;

      expect(getByTestId("receive-modal")).not.toBeNull();
    });

    it("should reload account after finish receiving tokens", async () => {
      const spyLoadSnsAccountTransactions = jest.spyOn(
        services,
        "loadSnsAccountTransactions"
      );

      const result = render(SnsWallet, props);

      await testModal({ result, testId: "receive-sns" });

      const { getByTestId, container } = result;

      await waitModalIntroEnd({
        container,
        selector: "[data-tid='reload-receive-account']",
      });

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() => expect(syncSnsAccounts).toHaveBeenCalled());
      expect(spyLoadSnsAccountTransactions).toHaveBeenCalled();
    });

    it("should display receive modal information", async () => {
      const result = render(SnsWallet, props);

      await testModal({ result, testId: "receive-sns" });

      const { getByText } = result;

      const store = get(selectedUniverseStore);

      const title = replacePlaceholders(en.wallet.sns_receive_note_title, {
        $tokenSymbol: store.summary?.token.symbol ?? "error-title-is-undefined",
      });

      const description = replacePlaceholders(en.wallet.sns_receive_note_text, {
        $tokenSymbol:
          store.summary?.token.symbol ?? "error-description-is-undefined",
      });

      expect(getByText(title)).toBeInTheDocument();
      expect(getByText(description)).toBeInTheDocument();
    });
  });
});
