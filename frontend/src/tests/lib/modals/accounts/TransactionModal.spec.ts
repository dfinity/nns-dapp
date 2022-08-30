/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../../lib/constants/icp.constants";
import TransactionModal from "../../../../lib/modals/accounts/NewTransaction/Modal.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { formattedTransactionFeeICP } from "../../../../lib/utils/icp.utils";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

describe("TransactionModal", () => {
  const renderTransactionModal = () =>
    renderModal({
      component: TransactionModal,
      props: {
        destinationAddress: mockMainAccount.identifier,
      },
    });

  const renderEnter10ICPAndNext = async (): Promise<RenderResult> => {
    const result = await renderTransactionModal();

    const { queryByText, getByTestId, container } = result;

    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const icpAmount = "10";
    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: icpAmount } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );

    fireEvent.click(participateButton);

    await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());
    expect(queryByText(icpAmount, { exact: false })).toBeInTheDocument();

    return result;
  };

  beforeEach(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
  });

  it("should display modal", async () => {
    const { container } = await renderTransactionModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display dropdown to select account and input to add amount", async () => {
    const { queryByTestId, container } = await renderTransactionModal();

    expect(queryByTestId("select-account-dropdown")).toBeInTheDocument();
    expect(container.querySelector("input[name='amount']")).toBeInTheDocument();
  });

  it("should trigger close on cancel", async () => {
    const { getByTestId, component } = await renderTransactionModal();

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);

    await clickByTestId(getByTestId, "transaction-button-cancel");

    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should have disabled button by default", async () => {
    const { getByTestId } = await renderTransactionModal();

    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();
  });

  it("should enable button when input value changes", async () => {
    const { getByTestId, container } = await renderTransactionModal();

    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: "10" } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );
  });

  it("should move to the last step and render review info", async () => {
    const { getByText, getByTestId } = await renderEnter10ICPAndNext();

    expect(
      (
        getByTestId("transaction-review-source-account").textContent ?? ""
      ).includes(mockMainAccount.identifier)
    ).toBeTruthy();
    expect(
      getByText(formattedTransactionFeeICP(DEFAULT_TRANSACTION_FEE_E8S))
    ).toBeInTheDocument();
  });

  it("should move to the last step and trigger nnsSubmit event", async () => {
    const { getByTestId, component } = await renderEnter10ICPAndNext();

    const onSubmit = jest.fn();
    component.$on("nnsSubmit", onSubmit);

    const confirmButton = getByTestId("transaction-button-execute");

    fireEvent.click(confirmButton);

    await waitFor(() => expect(onSubmit).toBeCalled());
  });

  it("should move to the last step and go back", async () => {
    const { getByTestId, container } = await renderTransactionModal();

    const participateButton = getByTestId("transaction-button-next");

    expect(participateButton).toBeInTheDocument();

    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: "10" } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );

    fireEvent.click(participateButton);
    await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());

    await clickByTestId(getByTestId, "transaction-button-back");
    await waitFor(() => expect(getByTestId("transaction-step-1")).toBeTruthy());
  });
});
