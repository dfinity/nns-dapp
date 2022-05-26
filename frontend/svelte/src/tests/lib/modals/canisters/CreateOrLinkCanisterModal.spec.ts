/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import CreateOrLinkCanisterModal from "../../../../lib/modals/canisters/CreateOrLinkCanisterModal.svelte";
import { attachCanister } from "../../../../lib/services/canisters.services";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    attachCanister: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("CreateOrLinkCanisterModal", () => {
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

    const linkCanisterCard = queryByTestId("choose-link-as-new-canister");
    expect(linkCanisterCard).toBeInTheDocument();

    linkCanisterCard && (await fireEvent.click(linkCanisterCard));

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

    const buttonElement = queryByTestId("attach-canister-button");
    expect(buttonElement).not.toBeNull();

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);

    buttonElement && (await fireEvent.click(buttonElement));
    expect(attachCanister).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });

  it("should show an error and have disabled button if the principal is not valid", async () => {
    const { queryByTestId, queryByText, container } = await renderModal({
      component: CreateOrLinkCanisterModal,
    });

    const linkCanisterCard = queryByTestId("choose-link-as-new-canister");
    expect(linkCanisterCard).toBeInTheDocument();

    linkCanisterCard && (await fireEvent.click(linkCanisterCard));

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
});
