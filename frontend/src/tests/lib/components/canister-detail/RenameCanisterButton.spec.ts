/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import RenameCanisterButtonTest from "./RenameCanisterButtonTest.svelte";

describe("RenameCanisterButton", () => {
  it("opens rename canister modal", async () => {
    const { queryByTestId } = render(RenameCanisterButtonTest);

    const buttonElement = queryByTestId("rename-canister-button-component");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("rename-canister-modal-component");
    expect(modal).toBeInTheDocument();
  });
});
