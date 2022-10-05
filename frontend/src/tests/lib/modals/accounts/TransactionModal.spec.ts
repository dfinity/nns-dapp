/**
 * @jest-environment jsdom
 */

import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import TransactionModal from "$lib/modals/accounts/NewTransaction/TransactionModal.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import type { Account } from "$lib/types/account";
import { formattedTransactionFeeICP } from "$lib/utils/icp.utils";
import { TokenAmount } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

describe("TransactionModal", () => {
  const renderTransactionModal = (props?: {
    destinationAddress?: string;
    sourceAccount?: Account;
    transactionFee?: TokenAmount;
  }) =>
    renderModal({
      component: TransactionModal,
      props: props ?? {},
    });

  beforeEach(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));
  });

  const renderEnter10ICPAndNext = async (
    destination?: string,
    transactionFee?: TokenAmount
  ): Promise<RenderResult> => {
    const result = await renderTransactionModal({
      destinationAddress: destination,
      transactionFee,
    });

    const { queryAllByText, getByTestId, container } = result;

    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const icpAmount = "10";
    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: icpAmount } });

    // Choose select account
    // It will choose the fist subaccount as default
    const toggle = container.querySelector("input[id='toggle']");
    toggle && fireEvent.click(toggle);

    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );

    fireEvent.click(participateButton);

    await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());
    expect(queryAllByText(icpAmount, { exact: false }).length).toBe(2);

    return result;
  };

  describe("when destination is not provided", () => {
    it("should display modal", async () => {
      const { container } = await renderTransactionModal();

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    it("should display dropdown to select account, input to add amount and select destination account", async () => {
      const { queryByTestId, container } = await renderTransactionModal();

      expect(queryByTestId("select-account-dropdown")).toBeInTheDocument();
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
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

    it("should enable button when input value and select a destination changes", async () => {
      const { getByTestId, container } = await renderTransactionModal();

      const participateButton = getByTestId("transaction-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });

      // Choose select account
      // It will choose the fist subaccount as default
      const toggle = container.querySelector("input[id='toggle']");
      toggle && fireEvent.click(toggle);

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

    it("should move to the last step and render passed transaction fee", async () => {
      const fee = TokenAmount.fromE8s({
        amount: BigInt(20_000),
        token: {
          symbol: "TST",
          name: "Test token",
        },
      });
      const { getByText, getByTestId } = await renderEnter10ICPAndNext(
        undefined,
        fee
      );

      expect(
        (
          getByTestId("transaction-review-source-account").textContent ?? ""
        ).includes(mockMainAccount.identifier)
      ).toBeTruthy();
      expect(
        getByText(formattedTransactionFeeICP(Number(fee.toE8s())))
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

      // Choose select account
      // It will choose the fist subaccount as default
      const toggle = container.querySelector("input[id='toggle']");
      toggle && fireEvent.click(toggle);

      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(participateButton);
      await waitFor(() =>
        expect(getByTestId("transaction-step-2")).toBeTruthy()
      );

      await clickByTestId(getByTestId, "transaction-button-back");
      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeTruthy()
      );
    });
  });

  describe("when destination address is provided", () => {
    it("should not show the select destination component", async () => {
      const { queryByTestId, container } = await renderTransactionModal({
        destinationAddress: mockMainAccount.identifier,
      });

      expect(queryByTestId("select-account-dropdown")).toBeInTheDocument();
      expect(queryByTestId("select-destination")).not.toBeInTheDocument();
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
    });
  });

  describe("when source account is provided", () => {
    it("should not show the select account component", async () => {
      const { queryByTestId, container } = await renderTransactionModal({
        sourceAccount: mockMainAccount,
      });

      expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
    });
  });
});
