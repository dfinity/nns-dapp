/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import LinkCanisterModal from "../../../../lib/modals/canisters/LinkCanisterModal.svelte";
import { attachCanister } from "../../../../lib/services/canisters.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    attachCanister: jest.fn().mockResolvedValue({ success: true }),
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

describe("LinkCanisterModal", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );
  it("should display modal", () => {
    const { container } = render(LinkCanisterModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should attach an existing canister and close modal", async () => {
    const { queryByTestId, container, component } = await renderModal({
      component: LinkCanisterModal,
    });

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
      component: LinkCanisterModal,
    });

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
});
