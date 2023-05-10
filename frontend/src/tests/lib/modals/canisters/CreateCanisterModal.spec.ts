import { NEW_CANISTER_MIN_T_CYCLES } from "$lib/constants/canisters.constants";
import CreateCanisterModal from "$lib/modals/canisters/CreateCanisterModal.svelte";
import {
  createCanister,
  getIcpToCyclesExchangeRate,
} from "$lib/services/canisters.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { toastsShow } from "$lib/stores/toasts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockCanister } from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { vi } from "vitest";

vi.mock("$lib/services/canisters.services", () => {
  return {
    getIcpToCyclesExchangeRate: vi.fn().mockResolvedValue(BigInt(10_000)),
    createCanister: vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockCanister.canister_id)),
  };
});

vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsShow: vi.fn(),
    toastsSuccess: vi.fn(),
  };
});

describe("CreateCanisterModal", () => {
  vi.spyOn(accountsStore, "subscribe").mockImplementation(
    mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
  );

  it("should display modal", () => {
    const { container } = render(CreateCanisterModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should create a canister from ICP and close modal", async () => {
    const {
      queryByTestId,
      queryAllByTestId,
      container,
      component,
      queryByText,
    } = await renderModal({
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

    expect(
      queryByText(en.canisters.review_create_canister)
    ).toBeInTheDocument();

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

    const done = vi.fn();
    component.$on("nnsClose", done);

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button");

    await waitFor(() => expect(done).toBeCalled());
    expect(createCanister).toBeCalled();
    expect(toastsShow).toBeCalled();
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
