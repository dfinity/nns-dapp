/**
 * @jest-environment jsdom
 */
import {
  getIcpToCyclesExchangeRate,
  topUpCanister,
} from "$lib/services/canisters.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { toastsSuccess } from "$lib/stores/toasts.store";
import { mockCanister } from "$tests/mocks/canisters.mock";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import AddCyclesModalTest from "./AddCyclesModalTest.svelte";

jest.mock("$lib/services/canisters.services", () => {
  return {
    getIcpToCyclesExchangeRate: jest.fn().mockResolvedValue(BigInt(100_000)),
    topUpCanister: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsSuccess: jest.fn(),
  };
});

describe("AddCyclesModal", () => {
  jest
    .spyOn(icpAccountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );

  const reloadDetails = jest.fn();
  const props = { reloadDetails };
  afterEach(() => jest.clearAllMocks());
  it("should display modal", () => {
    const { container } = render(AddCyclesModalTest, { props });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should be able to go back", async () => {
    const { queryByTestId, container } = await renderModal({
      component: AddCyclesModalTest,
      props,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

    selectAccount({ container });

    const icpInputElement = container.querySelector('input[name="icp-amount"]');
    expect(icpInputElement).not.toBeNull();

    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value: 2 },
      }));
    icpInputElement && (await fireEvent.blur(icpInputElement));

    await clickByTestId(queryByTestId, "select-cycles-button");

    // Confirm Create Canister Screen
    await waitFor(() =>
      expect(
        queryByTestId("confirm-cycles-canister-screen")
      ).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button-back");

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );
  });

  const selectAccount = ({ container, selectedAccount = mockMainAccount }) => {
    const accountCards = container.querySelectorAll(
      '[data-tid="select-account-dropdown"] option'
    );
    expect(accountCards.length).toBe(2);

    const selectElement = container.querySelector("select");
    selectElement &&
      expect(selectElement.value).toBe(mockMainAccount.identifier);

    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: selectedAccount.identifier },
      });
  };

  const testTopUp = async (selectedAccount = mockMainAccount) => {
    const { queryByTestId, container, component } = await renderModal({
      component: AddCyclesModalTest,
      props,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

    selectAccount({ container, selectedAccount });

    const icpInputElement = container.querySelector('input[name="icp-amount"]');
    expect(icpInputElement).not.toBeNull();

    const icpAmount = 2;
    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value: icpAmount },
      }));
    icpInputElement && (await fireEvent.blur(icpInputElement));

    await clickByTestId(queryByTestId, "select-cycles-button");

    // Confirm Create Canister Screen
    await waitFor(() =>
      expect(
        queryByTestId("confirm-cycles-canister-screen")
      ).toBeInTheDocument()
    );

    const done = jest.fn();
    component.$on("nnsClose", done);

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button");

    await waitFor(() => expect(done).toBeCalled());
    expect(topUpCanister).toBeCalledWith({
      canisterId: mockCanister.canister_id,
      amount: icpAmount,
      account: selectedAccount ?? mockMainAccount,
    });
    expect(reloadDetails).toBeCalled();
    expect(toastsSuccess).toBeCalled();
  };

  it("should top up a canister from ICP and close modal", async () => {
    await testTopUp();
  });

  it("should top up a canister with sub account and close modal", async () => {
    await testTopUp(mockSubAccount);
  });

  // We added the hardware wallet in the accountsStore subscribe mock above.
  it("should not show hardware wallets in the accounts list", async () => {
    const { container, queryByText } = await renderModal({
      component: AddCyclesModalTest,
      props,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    selectAccount({ container });

    expect(queryByText(mockHardwareWalletAccount.name as string)).toBeNull();
  });
});
