/**
 * @jest-environment jsdom
 */

import { detachCanister } from "$lib/services/canisters.services";
import { fireEvent, render } from "@testing-library/svelte";
import DetachActionButtonTest from "./DetachActionButtonTest.svelte";

jest.mock("$lib/services/canisters.services", () => {
  return {
    detachCanister: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("DissolveActionButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders button", () => {
    const { queryByTestId } = render(DetachActionButtonTest);
    expect(queryByTestId("detach-canister-button")).toBeInTheDocument();
  });

  it("calls detachCanister when confirming modal", async () => {
    const { queryByTestId } = render(DetachActionButtonTest);

    const buttonElement = queryByTestId("detach-canister-button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("detach-canister-confirmaation-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(detachCanister).toBeCalled();
  });
});
