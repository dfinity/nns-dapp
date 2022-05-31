/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import CreateOrLinkCanisterModal from "../../../../lib/modals/canisters/CreateOrLinkCanisterModal.svelte";
import {
  attachCanister,
  createCanister,
  getIcpToCyclesExchangeRate,
} from "../../../../lib/services/canisters.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { toastsStore } from "../../../../lib/stores/toasts.store";
import { clickByTestId } from "../../../lib/testHelpers/clickByTestId";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    attachCanister: jest.fn().mockResolvedValue({ success: true }),
    getIcpToCyclesExchangeRate: jest.fn().mockResolvedValue(BigInt(100_000)),
    createCanister: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("../../../../lib/stores/toasts.store", () => {
  return {
    toastsStore: {
      success: jest.fn(),
    },
  };
});

describe("CreateOrLinkCanisterModal", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );
  it("should display modal", () => {
    const { container } = render(CreateOrLinkCanisterModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display two button cards", async () => {
    const { container } = await renderModal({
      component: CreateOrLinkCanisterModal,
    });

    const buttons = container.querySelectorAll('article[role="button"]');
    expect(buttons.length).toEqual(2);
  });

  it("should attach an existing canister and close modal", async () => {
    const { queryByTestId, container, component } = await renderModal({
      component: CreateOrLinkCanisterModal,
    });

    await clickByTestId(queryByTestId, "choose-link-as-new-canister");

    // AttachCanister Screen
    await waitFor(() =>
      expect(queryByTestId("attach-canister-modal")).toBeInTheDocument()
    );

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "aaaaa-aa" },
      }));

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);

    await clickByTestId(queryByTestId, "attach-canister-button");
    expect(attachCanister).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should show an error and have disabled button if the principal is not valid", async () => {
    const { queryByTestId, queryByText, container } = await renderModal({
      component: CreateOrLinkCanisterModal,
    });

    await clickByTestId(queryByTestId, "choose-link-as-new-canister");

    // AttachCanister Screen
    await waitFor(() =>
      expect(queryByTestId("attach-canister-modal")).toBeInTheDocument()
    );

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "not-valid" },
      }));
    inputElement && (await fireEvent.blur(inputElement));

    expect(queryByText(en.error.principal_not_valid)).toBeInTheDocument();

    const buttonElement = queryByTestId("attach-canister-button");
    expect(buttonElement).not.toBeNull();
    expect(buttonElement?.hasAttribute("disabled")).toBe(true);
  });

  it("should create a canister from ICP and close modal", async () => {
    const { queryByTestId, queryAllByTestId, container, component } =
      await renderModal({
        component: CreateOrLinkCanisterModal,
      });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    await clickByTestId(queryByTestId, "choose-create-as-new-canister");

    // Select Account Screen
    await waitFor(() =>
      expect(queryAllByTestId("account-card").length).toBeGreaterThan(0)
    );
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
        queryByTestId("confirm-create-canister-screen")
      ).toBeInTheDocument()
    );

    const done = jest.fn();
    component.$on("nnsClose", done);

    await clickByTestId(queryByTestId, "confirm-create-canister-button");

    await waitFor(() => expect(done).toBeCalled());
    expect(createCanister).toBeCalled();
    expect(toastsStore.success).toBeCalled();
  });

  // We added the hardware wallet in the accountsStore subscribe mock above.
  it("should not show hardware wallets in the accounts list", async () => {
    const { queryByTestId, queryAllByTestId, queryByText } = await renderModal({
      component: CreateOrLinkCanisterModal,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    await clickByTestId(queryByTestId, "choose-create-as-new-canister");

    // Select Account Screen
    await waitFor(() =>
      expect(queryAllByTestId("account-card").length).toBeGreaterThan(0)
    );
    const accountCards = queryAllByTestId("account-card");

    expect(accountCards.length).toBe(2);
    expect(queryByText(mockHardwareWalletAccount.name as string)).toBeNull();
  });
});
