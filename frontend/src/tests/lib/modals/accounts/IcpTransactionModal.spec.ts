/**
 * @jest-environment jsdom
 */

import IcpTransactionModal from "$lib/components/modals/accounts/IcpTransactionModal.svelte";
import { transferICP } from "$lib/services/accounts.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { fireEvent, waitFor } from "@testing-library/svelte";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";

jest.mock("$lib/services/accounts.services", () => {
  return {
    transferICP: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("IcpTransactionModal", () => {
  const renderTransactionModal = () =>
    renderModal({
      component: IcpTransactionModal,
      props: {},
    });

  beforeEach(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));
  });

  it("should transfer icps", async () => {
    const { queryAllByText, getByTestId, container } =
      await renderTransactionModal();

    await waitFor(() =>
      expect(getByTestId("transaction-step-1")).toBeInTheDocument()
    );
    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    // Enter amount
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
    expect(queryAllByText(icpAmount, { exact: false }).length).toBeGreaterThan(
      0
    );

    const confirmButton = getByTestId("transaction-button-execute");
    fireEvent.click(confirmButton);

    await waitFor(() => expect(transferICP).toBeCalled());
  });
});
