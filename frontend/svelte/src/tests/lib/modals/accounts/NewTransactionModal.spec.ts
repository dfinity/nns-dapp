/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";
import NewTransactionModal from "../../../../lib/modals/accounts/NewTransactionModal.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

describe("NewTransactionModal", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

  it("should display modal", async () => {
    const { container } = await renderModal(NewTransactionModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should navigate back and forth between step SelectAccount and SelectDestination", async () => {
    const { container, getByText } = await renderModal(NewTransactionModal);

    expect(
      getByText(en.accounts.select_source, { exact: false })
    ).toBeInTheDocument();

    const mainAccount = container.querySelector(
      'article[role="button"]:first-of-type'
    ) as HTMLButtonElement;
    fireEvent.click(mainAccount);

    await waitFor(() =>
      expect(
        getByText(en.accounts.select_destination, { exact: false })
      ).toBeInTheDocument()
    );

    const back = container.querySelector("button.back") as HTMLButtonElement;
    fireEvent.click(back);

    await waitFor(() =>
      expect(
        getByText(en.accounts.select_source, { exact: false })
      ).toBeInTheDocument()
    );
  });
});
