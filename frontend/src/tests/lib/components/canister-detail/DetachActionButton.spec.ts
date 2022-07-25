/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import DetachActionButton from "../../../../lib/components/canister-detail/DetachCanisterButton.svelte";
import { detachCanister } from "../../../../lib/services/canisters.services";
import { mockCanister } from "../../../mocks/canisters.mock";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    detachCanister: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("DissolveActionButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders button", () => {
    const { queryByTestId } = render(DetachActionButton, {
      props: {
        canisterId: mockCanister.canister_id,
      },
    });
    expect(queryByTestId("detach-canister-button")).toBeInTheDocument();
  });

  it("calls detachCanister when confirming modal", async () => {
    const { queryByTestId } = render(DetachActionButton, {
      props: {
        canisterId: mockCanister.canister_id,
      },
    });

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
