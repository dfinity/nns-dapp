import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
import LinkCanisterModal from "$lib/modals/canisters/LinkCanisterModal.svelte";
import { attachCanister } from "$lib/services/canisters.services";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { nonNullish } from "@dfinity/utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/canisters.services", () => {
  return {
    attachCanister: vi.fn().mockResolvedValue({ success: true }),
  };
});

vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsShow: vi.fn(),
    toastsSuccess: vi.fn(),
  };
});

describe("LinkCanisterModal", () => {
  it("should display modal", () => {
    const { container } = render(LinkCanisterModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  const fillForm = async ({ container, name, principalText }) => {
    const inputElement = container.querySelector("input[name='principal']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: principalText },
      }));

    if (nonNullish(name)) {
      const nameInputElement = container.querySelector(
        "input[name='canister-name']"
      );
      nameInputElement &&
        (await fireEvent.input(nameInputElement, {
          target: { value: name },
        }));
    }
  };

  it("should attach a canister by id and close modal", async () => {
    const { queryByTestId, container, component } = await renderModal({
      component: LinkCanisterModal,
    });

    await fillForm({
      container,
      name: "test",
      principalText: "aaaaa-aa",
    });

    const onClose = vi.fn();
    component.$on("nnsClose", onClose);

    await clickByTestId(queryByTestId, "link-canister-button");
    expect(attachCanister).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should attach a canister by id if name is maximum length", async () => {
    const { queryByTestId, container } = await renderModal({
      component: LinkCanisterModal,
    });

    await fillForm({
      container,
      name: "test",
      principalText: "z".repeat(MAX_CANISTER_NAME_LENGTH),
    });

    await clickByTestId(queryByTestId, "link-canister-button");
    expect(attachCanister).toBeCalled();
  });

  it("should close modal on cancel", async () => {
    const { queryByTestId, component } = await renderModal({
      component: LinkCanisterModal,
    });

    const onClose = vi.fn();
    component.$on("nnsClose", onClose);

    await clickByTestId(queryByTestId, "cancel-button");
    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should show an error and have disabled button if the principal is not valid", async () => {
    const { queryByTestId, queryByText, container } = await renderModal({
      component: LinkCanisterModal,
    });

    await fillForm({
      container,
      name: undefined,
      principalText: "not-valid",
    });

    const inputElement = container.querySelector("input[name='principal']");
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

    await fillForm({
      container,
      name: "a".repeat(MAX_CANISTER_NAME_LENGTH + 1),
      principalText: "aaaaa-aa",
    });

    const nameInputElement = container.querySelector(
      "input[name='canister-name']"
    );
    nameInputElement && (await fireEvent.blur(nameInputElement));

    expect(
      queryByText("Canister name too long. Maximum of 24 characters allowed.")
    ).toBeInTheDocument();
    expect(
      queryByTestId("link-canister-button")?.hasAttribute("disabled")
    ).toBe(true);
  });
});
