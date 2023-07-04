/**
 * @jest-environment jsdom
 */
import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
import LinkCanisterModal from "$lib/modals/canisters/LinkCanisterModal.svelte";
import { attachCanister } from "$lib/services/canisters.services";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/services/canisters.services", () => {
  return {
    attachCanister: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsShow: jest.fn(),
    toastsSuccess: jest.fn(),
  };
});

describe("LinkCanisterModal", () => {
  it("should display modal", () => {
    const { container } = render(LinkCanisterModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should attach a canister by id and close modal", async () => {
    const { queryByTestId, container, component } = await renderModal({
      component: LinkCanisterModal,
    });

    const inputElement = container.querySelector("input[name='principal']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "aaaaa-aa" },
      }));

    const nameInputElement = container.querySelector(
      "input[name='canister-name']"
    );
    nameInputElement &&
      (await fireEvent.input(nameInputElement, {
        target: { value: "My fancy canister" },
      }));

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);

    await clickByTestId(queryByTestId, "link-canister-button");
    expect(attachCanister).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should close modal on cancel", async () => {
    const { queryByTestId, component } = await renderModal({
      component: LinkCanisterModal,
    });

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);

    await clickByTestId(queryByTestId, "cancel-button");
    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should show an error and have disabled button if the principal is not valid", async () => {
    const { queryByTestId, queryByText, container } = await renderModal({
      component: LinkCanisterModal,
    });

    const inputElement = container.querySelector("input[name='principal']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "not-valid" },
      }));
    inputElement && (await fireEvent.blur(inputElement));

    expect(queryByText(en.error.principal_not_valid)).toBeInTheDocument();

    const buttonElement = queryByTestId("link-canister-button");
    expect(buttonElement).not.toBeNull();
    expect(buttonElement?.hasAttribute("disabled")).toBe(true);
  });

  it("should show an error and have disabled button if name is longer than max", async () => {
    const { queryByTestId, queryByText, container } = await renderModal({
      component: LinkCanisterModal,
    });

    const inputElement = container.querySelector("input[name='principal']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "aaaaa-aa" },
      }));

    const nameInputElement = container.querySelector(
      "input[name='canister-name']"
    );
    nameInputElement &&
      (await fireEvent.input(nameInputElement, {
        target: { value: "a".repeat(MAX_CANISTER_NAME_LENGTH + 1) },
      }));
    nameInputElement && (await fireEvent.blur(nameInputElement));

    expect(
      queryByText("Canister name too long. Maximum of 24 characters allowed.")
    ).toBeInTheDocument();
    expect(
      queryByTestId("link-canister-button")?.hasAttribute("disabled")
    ).toBe(true);
  });
});
