/**
 * @jest-environment jsdom
 */

import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
import { snsTransferTokens } from "$lib/services/sns-accounts.services";
import { routeStore } from "$lib/stores/route.store";
import type { Account } from "$lib/types/account";
import { paths } from "$lib/utils/app-path.utils";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { renderModal } from "../../../mocks/modal.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "../../../mocks/sns-accounts.mock";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    snsTransferTokens: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsTransactionModal", () => {
  const renderTransactionModal = (selectedAccount?: Account) =>
    renderModal({
      component: SnsTransactionModal,
      props: {
        selectedAccount,
      },
    });

  beforeEach(() => {
    jest
      .spyOn(snsProjectAccountsStore, "subscribe")
      .mockImplementation(mockSnsAccountsStoreSubscribe([mockSnsMainAccount]));

    routeStore.update({ path: paths.accounts("aaaaa-aa") });
  });

  it("should transfer tokens", async () => {
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

    // Enter valid destination address
    const addressInput = container.querySelector(
      "input[name='accounts-address']"
    );
    addressInput &&
      fireEvent.input(addressInput, { target: { value: "aaaaa-aa" } });
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

    await waitFor(() => expect(snsTransferTokens).toBeCalled());
  });

  it("should not render the select account dropdown if selected account is passed", async () => {
    const { queryByTestId } = await renderTransactionModal(mockSnsMainAccount);

    await waitFor(() =>
      expect(queryByTestId("transaction-step-1")).toBeInTheDocument()
    );
    expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();
  });
});
