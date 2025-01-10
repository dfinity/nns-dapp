import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import * as canistersServices from "$lib/services/canisters.services";
import {
  getIcpToCyclesExchangeRate,
  topUpCanister,
} from "$lib/services/canisters.services";
import { mockCanister } from "$tests/mocks/canisters.mock";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";
import AddCyclesModalTest from "$tests/lib/modals/canisters/AddCyclesModalTest.svelte";

describe("AddCyclesModal", () => {
  const reloadDetails = vi.fn();
  const props = { reloadDetails };
  beforeEach(() => {
    vi.spyOn(canistersServices, "getIcpToCyclesExchangeRate").mockResolvedValue(
      100_000n
    );
    vi.spyOn(canistersServices, "topUpCanister").mockResolvedValue({
      success: true,
    });
    vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );
  });

  it("should display modal", () => {
    const { container } = render(AddCyclesModalTest, { props });

    expect(container.querySelector("div.modal")).not.toBeNull();
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

    const done = vi.fn();
    component.$on("nnsClose", done);

    expect(get(toastsStore)).toEqual([]);

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button");

    await waitFor(() => expect(done).toBeCalled());
    expect(topUpCanister).toBeCalledWith({
      canisterId: mockCanister.canister_id,
      amount: icpAmount,
      account: selectedAccount ?? mockMainAccount,
    });
    expect(reloadDetails).toBeCalled();
    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "Cycles added successfully",
      },
    ]);
  };

  it("should top up a canister from ICP and close modal", async () => {
    await testTopUp();
  });

  it("should top up a canister with sub account and close modal", async () => {
    await testTopUp(mockSubAccount);
  });

  // We added the Ledger device in the accountsStore subscribe mock above.
  it("should not show Ledger devices in the accounts list", async () => {
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
