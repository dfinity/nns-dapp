import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
import { transferICP } from "$lib/services/icp-accounts.services";
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

vi.mock("$lib/services/icp-accounts.services", () => {
  return {
    transferICP: vi.fn().mockResolvedValue({ success: true }),
  };
});

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
});
