/**
 * @jest-environment jsdom
 */

import { LedgerCanister } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import NewTransactionModal from "../../../../lib/modals/accounts/NewTransactionModal.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { toastsStore } from "../../../../lib/stores/toasts.store";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { MockLedgerCanister } from "../../../mocks/ledger.canister.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { MockNNSDappCanister } from "../../../mocks/nns-dapp.canister.mock";

describe("NewTransactionModal", () => {
  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();
  const mockNNSDappCanister: MockNNSDappCanister = new MockNNSDappCanister();

  let successSpy;
  beforeAll(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    successSpy = jest.spyOn(toastsStore, "success");
  });

  afterAll(() => jest.clearAllMocks());

  it("should display modal", async () => {
    const { container } = await renderModal({
      component: NewTransactionModal,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  const goToStep2 = async ({ container, getByText }) => {
    const mainAccount = container.querySelector(
      'article[role="button"]:first-of-type'
    ) as HTMLButtonElement;
    fireEvent.click(mainAccount);

    await waitFor(() =>
      expect(
        getByText(en.accounts.select_destination, { exact: false })
      ).toBeInTheDocument()
    );
  };

  const goToStep3 = async ({ container, getByText }) => {
    const subAccount = container.querySelector(
      'article[role="button"]:last-of-type'
    ) as HTMLButtonElement;
    fireEvent.click(subAccount);

    await waitFor(() =>
      expect(
        getByText(en.accounts.enter_icp_amount, { exact: false })
      ).toBeInTheDocument()
    );
  };

  const goToStep4 = async ({
    container,
    getByText,
    enterAmount,
  }: {
    container: HTMLElement;
    getByText;
    enterAmount: boolean;
  }) => {
    if (enterAmount) {
      const input: HTMLInputElement = container.querySelector(
        "input"
      ) as HTMLInputElement;
      await fireEvent.input(input, { target: { value: "1" } });
    }

    const button: HTMLButtonElement | null = container.querySelector(
      'button[type="submit"]'
    );

    await waitFor(() => expect(button?.getAttribute("disabled")).toBeNull());

    fireEvent.click(button as HTMLButtonElement);

    await waitFor(() =>
      expect(
        getByText(en.accounts.review_transaction, { exact: false })
      ).toBeInTheDocument()
    );
  };

  const goBack = async ({ container, getByText, title }) => {
    const back = container.querySelector("button.back") as HTMLButtonElement;
    fireEvent.click(back);

    await waitFor(() =>
      expect(getByText(title, { exact: false })).toBeInTheDocument()
    );
  };

  it("should navigate back and forth between steps", async () => {
    const { container, getByText } = await renderModal({
      component: NewTransactionModal,
    });

    // Is step 1 active?

    expect(
      getByText(en.accounts.select_source, { exact: false })
    ).toBeInTheDocument();

    // Go to step 2.
    await goToStep2({ container, getByText });

    // Go back to step 1.
    await goBack({ container, getByText, title: en.accounts.select_source });

    // Go to step 2.
    await goToStep2({ container, getByText });

    // Go to step 3.
    await goToStep3({ container, getByText });

    // Go back to step 2.
    await goBack({
      container,
      getByText,
      title: en.accounts.select_destination,
    });

    // Go to step 3.
    await goToStep3({ container, getByText });

    // Go to step 4.
    await goToStep4({ container, getByText, enterAmount: true });

    // Go back to step 3.
    await goBack({
      container,
      getByText,
      title: en.accounts.enter_icp_amount,
    });

    // Go back to step 2.
    await goBack({
      container,
      getByText,
      title: en.accounts.select_destination,
    });

    // Go to step 3.
    await goToStep3({ container, getByText });

    // Go to step 4 without entering the amount again as it should be kept in store - input should be set with previous value
    await goToStep4({ container, getByText, enterAmount: false });
  });

  it("should close wizard once transaction executed", async () => {
    const { container, getByText, component } = await renderModal({
      component: NewTransactionModal,
    });

    await goToStep2({ container, getByText });

    await goToStep3({ container, getByText });

    await goToStep4({ container, getByText, enterAmount: true });

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);
    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(onClose).toBeCalled());
    expect(successSpy).toBeCalled();
  });

  it("should call on complete callback if passed when transaction is executed", async () => {
    const completeTransactionSpy = jest.fn().mockResolvedValue(undefined);
    const { container, getByText, component } = await renderModal({
      component: NewTransactionModal,
      props: {
        onTransactionComplete: completeTransactionSpy,
      },
    });

    await goToStep2({ container, getByText });

    await goToStep3({ container, getByText });

    await goToStep4({ container, getByText, enterAmount: true });

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);
    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(onClose).toBeCalled());
    await waitFor(() => expect(completeTransactionSpy).toHaveBeenCalled());
  });
});
