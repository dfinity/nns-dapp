/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { NEW_CANISTER_MIN_T_CYCLES } from "../../../../lib/constants/canisters.constants";
import CreateCanisterModal from "../../../../lib/modals/canisters/CreateCanisterModal.svelte";
import {
  createCanister,
  getIcpToCyclesExchangeRate,
} from "../../../../lib/services/canisters.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { toastsStore } from "../../../../lib/stores/toasts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { mockCanister } from "../../../mocks/canisters.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    getIcpToCyclesExchangeRate: jest.fn().mockResolvedValue(BigInt(10_000)),
    createCanister: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCanister.canister_id)),
  };
});

jest.mock("../../../../lib/stores/toasts.store", () => {
  return {
    toastsStore: {
      show: jest.fn(),
      success: jest.fn(),
    },
  };
});

describe("CreateCanisterModal", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );
  it("should display modal", () => {
    const { container } = render(CreateCanisterModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should create a canister from ICP and close modal", async () => {
    const { queryByTestId, queryAllByTestId, container, component } =
      await renderModal({
        component: CreateCanisterModal,
      });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const accountCards = queryAllByTestId("account-card");
    expect(accountCards.length).toBe(2);

    fireEvent.click(accountCards[0]);

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

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

    const done = jest.fn();
    component.$on("nnsClose", done);

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button");

    await waitFor(() => expect(done).toBeCalled());
    expect(createCanister).toBeCalled();
    expect(toastsStore.show).toBeCalled();
  });

  // We added the hardware wallet in the accountsStore subscribe mock above.
  it("should not show hardware wallets in the accounts list", async () => {
    const { queryAllByTestId, queryByText } = await renderModal({
      component: CreateCanisterModal,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const accountCards = queryAllByTestId("account-card");

    expect(accountCards.length).toBe(2);
    expect(queryByText(mockHardwareWalletAccount.name as string)).toBeNull();
  });

  it("should have disabled button when creating canister with less T Cycles than minimum", async () => {
    const { queryByTestId, queryAllByTestId, container } = await renderModal({
      component: CreateCanisterModal,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const accountCards = queryAllByTestId("account-card");
    expect(accountCards.length).toBe(2);

    fireEvent.click(accountCards[0]);

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

    const icpInputElement = container.querySelector('input[name="icp-amount"]');
    expect(icpInputElement).not.toBeNull();

    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value: NEW_CANISTER_MIN_T_CYCLES - 0.2 },
      }));
    icpInputElement && (await fireEvent.blur(icpInputElement));

    const continueButton = queryByTestId("select-cycles-button");
    expect(continueButton).not.toBeNull();
    continueButton &&
      expect(continueButton.hasAttribute("disabled")).toBeTruthy();
  });
});
