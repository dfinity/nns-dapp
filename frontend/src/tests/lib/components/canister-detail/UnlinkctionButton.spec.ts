import { detachCanister } from "$lib/services/canisters.services";
import { fireEvent, render } from "@testing-library/svelte";
import UnlinkActionButtonTest from "./UnlinkActionButtonTest.svelte";

vi.mock("$lib/services/canisters.services", () => {
  return {
    detachCanister: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("DissolveActionButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders button", () => {
    const { queryByTestId } = render(UnlinkActionButtonTest);
    expect(queryByTestId("unlink-canister-button")).toBeInTheDocument();
  });

  it("calls detachCanister when confirming modal", async () => {
    const { queryByTestId } = render(UnlinkActionButtonTest);

    const buttonElement = queryByTestId("unlink-canister-button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("unlink-canister-confirmation-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(detachCanister).toBeCalled();
  });
});
