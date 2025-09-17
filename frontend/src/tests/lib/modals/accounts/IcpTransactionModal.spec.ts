import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
import * as icpAccountsServices from "$lib/services/icp-accounts.services";
import { transferICP } from "$lib/services/icp-accounts.services";
import { transactionMemoOptionStore } from "$lib/stores/transaction-memo-option.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { IcpTransactionModalPo } from "$tests/page-objects/IcpTransactionModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { queryToggleById } from "$tests/utils/toggle.test-utils";
import { fireEvent, waitFor } from "@testing-library/svelte";

describe("IcpTransactionModal", () => {
  const renderTransactionModal = () =>
    renderModal({
      component: IcpTransactionModal,
      props: {},
    });

  const renderModalToPo = async () => {
    const { container } = await renderTransactionModal();

    return IcpTransactionModalPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();

    vi.spyOn(icpAccountsServices, "transferICP").mockResolvedValue({
      success: true,
    });
    vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount])
    );
  });

  it("should render token in the modal title", async () => {
    const po = await renderModalToPo();

    expect(await po.getModalTitle()).toBe("Send ICP");
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
    const toggle = queryToggleById(container);
    toggle && fireEvent.click(toggle);
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBe(false)
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

  it("should not show the memo field when Alfred memo option is not enabled", async () => {
    const { getByTestId, queryByTestId } = await renderTransactionModal();

    await waitFor(() =>
      expect(getByTestId("transaction-step-1")).toBeInTheDocument()
    );

    expect(queryByTestId("transaction-memo-input")).not.toBeInTheDocument();
  });

  it("should show the memo field when Alfred memo option is enabled", async () => {
    transactionMemoOptionStore.set("show");

    const { getByTestId } = await renderTransactionModal();

    await waitFor(() =>
      expect(getByTestId("transaction-step-1")).toBeInTheDocument()
    );

    expect(getByTestId("transaction-memo-input")).toBeInTheDocument();
  });

  it("displays memo value in review when provided and option enabled", async () => {
    transactionMemoOptionStore.set("show");

    const { getByTestId, container } = await renderTransactionModal();

    await waitFor(() =>
      expect(getByTestId("transaction-step-1")).toBeInTheDocument()
    );

    const amount = "10";
    const memo = "42";

    const amountInput = container.querySelector("input[name='amount']");
    amountInput && fireEvent.input(amountInput, { target: { value: amount } });

    const memoInput = container.querySelector("input[name='memo']");
    memoInput && fireEvent.input(memoInput, { target: { value: memo } });

    const toggle = queryToggleById(container);
    toggle && fireEvent.click(toggle);

    const continueButton = getByTestId("transaction-button-next");
    await waitFor(() =>
      expect(continueButton?.hasAttribute("disabled")).toBe(false)
    );
    fireEvent.click(continueButton);

    await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());

    expect(getByTestId("transaction-summary-memo").textContent).toEqual(memo);
  });
});
