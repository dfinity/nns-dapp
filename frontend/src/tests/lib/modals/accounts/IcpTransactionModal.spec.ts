import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
import * as icpAccountsServices from "$lib/services/icp-accounts.services";
import { transferICP } from "$lib/services/icp-accounts.services";
import { transactionMemoOptionStore } from "$lib/stores/transaction-memo-option.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
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

    // Should not display memo as the option is disabled by default
    const memoInput = container.querySelector('input[name="memo"]');
    expect(memoInput).not.toBeInTheDocument();

    const confirmButton = getByTestId("transaction-button-execute");
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(transferICP).toBeCalledWith({
        amount: parseInt(icpAmount),
        destinationAddress:
          "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
        memo: undefined,
        sourceAccount: mockMainAccount,
      })
    );
  });

  it("should show memo input when memo option is enabled and use it when transfering ICP", async () => {
    // Set memo option to show
    transactionMemoOptionStore.set("show");

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

    // Memo should be visible now
    const memoInput = container.querySelector('input[name="memo"]');
    expect(memoInput).toBeInTheDocument();
    const memo = "1234";
    memoInput && fireEvent.input(memoInput, { target: { value: memo } });

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

    await waitFor(() =>
      expect(transferICP).toBeCalledWith({
        amount: parseInt(icpAmount),
        destinationAddress:
          "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
        memo: "1234",
        sourceAccount: mockMainAccount,
      })
    );
  });
});
