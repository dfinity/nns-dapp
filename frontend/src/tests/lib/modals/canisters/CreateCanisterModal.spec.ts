/**
 * @jest-environment jsdom
 */
import {
  MAX_CANISTER_NAME_LENGTH,
  NEW_CANISTER_MIN_T_CYCLES,
} from "$lib/constants/canisters.constants";
import CreateCanisterModal from "$lib/modals/canisters/CreateCanisterModal.svelte";
import {
  createCanister,
  getIcpToCyclesExchangeRate,
} from "$lib/services/canisters.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { toastsShow } from "$lib/stores/toasts.store";
import { mockCanister } from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
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

jest.mock("$lib/services/canisters.services", () => {
  return {
    getIcpToCyclesExchangeRate: jest.fn().mockResolvedValue(BigInt(10_000)),
    createCanister: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCanister.canister_id)),
  };
});

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsShow: jest.fn(),
    toastsSuccess: jest.fn(),
  };
});

describe("CreateCanisterModal", () => {
  jest
    .spyOn(icpAccountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display modal", () => {
    const { container } = render(CreateCanisterModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  const selectAccountGoToNameForm = async ({
    container,
    queryByTestId,
    selectedAccount = mockMainAccount,
  }) => {
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

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

    // Enter Name Screen
    await waitFor(() =>
      expect(queryByTestId("create-canister-name-form")).toBeInTheDocument()
    );
  };

  const testCreateCanister = async ({
    canisterName,
    selectedAccount = undefined,
  }) => {
    const { queryByTestId, container, component, queryByText } =
      await renderModal({
        component: CreateCanisterModal,
      });
    await selectAccountGoToNameForm({
      container,
      queryByTestId,
      selectedAccount,
    });

    // Enter Name Screen
    await waitFor(() =>
      expect(queryByTestId("create-canister-name-form")).toBeInTheDocument()
    );

    if (canisterName.length > 0) {
      const nameInputElement = queryByTestId("input-ui-element");
      nameInputElement &&
        (await fireEvent.input(nameInputElement, {
          target: { value: canisterName },
        }));
    }

    await clickByTestId(queryByTestId, "confirm-text-input-screen-button");

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

    expect(
      queryByText(en.canisters.review_create_canister)
    ).toBeInTheDocument();

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

    if (canisterName.length > 0) {
      expect(queryByText(canisterName)).toBeInTheDocument();
    }

    const done = jest.fn();
    component.$on("nnsClose", done);

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button");

    await waitFor(() => expect(done).toBeCalled());
    expect(createCanister).toBeCalledWith({
      name: canisterName,
      amount: icpAmount,
      account: selectedAccount ?? mockMainAccount,
    });
    expect(toastsShow).toBeCalled();
  };

  it("should create a canister from ICP and close modal", async () => {
    await testCreateCanister({ canisterName: "best dapp ever" });
  });

  it("should create a canister with subAccount and close modal", async () => {
    await testCreateCanister({
      canisterName: "best dapp ever",
      selectedAccount: mockSubAccount,
    });
  });

  it("should create canister without name", async () => {
    await testCreateCanister({ canisterName: "" });
  });

  // We added the hardware wallet in the accountsStore subscribe mock above.
  it("should not show hardware wallets in the accounts list", async () => {
    const { container, queryByText } = await renderModal({
      component: CreateCanisterModal,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const accountCards = container.querySelectorAll(
      '[data-tid="select-account-dropdown"] option'
    );

    expect(accountCards.length).toBe(2);
    expect(queryByText(mockHardwareWalletAccount.name as string)).toBeNull();
  });

  it("should have disabled button when creating a canister with name longer than maximum allowed", async () => {
    const { queryByTestId, container } = await renderModal({
      component: CreateCanisterModal,
    });

    await selectAccountGoToNameForm({ container, queryByTestId });

    const longName = "a".repeat(MAX_CANISTER_NAME_LENGTH + 1);
    const nameInputElement = queryByTestId("input-ui-element");
    nameInputElement &&
      (await fireEvent.input(nameInputElement, {
        target: { value: longName },
      }));

    expect(
      queryByTestId("confirm-text-input-screen-button").getAttribute("disabled")
    ).not.toBeNull();
  });

  it("should have enabled button when creating a canister with name maximum allowed", async () => {
    const { queryByTestId, container } = await renderModal({
      component: CreateCanisterModal,
    });

    await selectAccountGoToNameForm({ container, queryByTestId });

    const longName = "a".repeat(MAX_CANISTER_NAME_LENGTH);
    const nameInputElement = queryByTestId("input-ui-element");
    nameInputElement &&
      (await fireEvent.input(nameInputElement, {
        target: { value: longName },
      }));

    expect(
      queryByTestId("confirm-text-input-screen-button").getAttribute("disabled")
    ).toBeNull();
  });

  it("should have disabled button when creating canister with less T Cycles than minimum", async () => {
    const { queryByTestId, container } = await renderModal({
      component: CreateCanisterModal,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const accountCards = container.querySelectorAll(
      '[data-tid="select-account-dropdown"] option'
    );
    expect(accountCards.length).toBe(2);

    // Enter Name Screen
    await waitFor(() =>
      expect(queryByTestId("create-canister-name-form")).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "confirm-text-input-screen-button");

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
