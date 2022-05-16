/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import RenameSubAccountAction from "../../../../lib/components/accounts/RenameSubAccountAction.svelte";
import { renameSubAccount } from "../../../../lib/services/accounts.services";
import { mockSubAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

jest.mock("../../../../lib/services/accounts.services");

describe("RenameSubAccountAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  let spy;

  beforeAll(() => {
    spy = (renameSubAccount as jest.Mock).mockImplementation(async () => {
      // Do nothing test
    });
  });

  it("should render a cta text", () => {
    const { getByText } = render(RenameSubAccountAction, {
      props: { selectedAccount: undefined },
    });

    expect(
      getByText(en.accounts.rename_account_enter_new_name)
    ).toBeInTheDocument();
  });

  it("should not enable rename action if no new name", () => {
    const { getByTestId } = render(RenameSubAccountAction, {
      props: { selectedAccount: undefined },
    });

    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;

    expect(button).not.toBeNull();
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should enable and disable action according input", async () => {
    const { container, getByTestId } = render(RenameSubAccountAction, {
      props: { selectedAccount: mockSubAccount },
    });

    const input = container.querySelector("input") as HTMLInputElement;

    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;
    expect(button.getAttribute("disabled")).not.toBeNull();

    await fireEvent.input(input, { target: { value: "test" } });
    expect(button.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, { target: { value: "" } });
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should disable action even if text entered if not account", async () => {
    const { container, getByTestId } = render(RenameSubAccountAction, {
      props: { selectedAccount: undefined },
    });

    const input = container.querySelector("input") as HTMLInputElement;
    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;

    await fireEvent.input(input, { target: { value: "test" } });
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should call rename action", async () => {
    const { container, getByTestId } = render(RenameSubAccountAction, {
      props: { selectedAccount: mockSubAccount },
    });

    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "test" } });

    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;
    await fireEvent.click(button);

    expect(spy).toHaveBeenCalled();
  });
});
