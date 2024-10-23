import RenameSubAccountAction from "$lib/components/accounts/RenameSubAccountAction.svelte";
import { renameSubAccount } from "$lib/services/icp-accounts.services";
import type { Account } from "$lib/types/account";
import { renderSelectedAccountContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSubAccount } from "$tests/mocks/icp-accounts.store.mock";
import { fireEvent } from "@testing-library/dom";
import type { Mock } from "vitest";

vi.mock("$lib/services/icp-accounts.services");

describe("RenameSubAccountAction", () => {
  let spy;

  beforeEach(() => {
    vi.restoreAllMocks();

    spy = (renameSubAccount as Mock).mockImplementation(async () => {
      // Do nothing test
    });
  });

  const renderTestCmp = (account: Account | undefined) =>
    renderSelectedAccountContext({
      Component: RenameSubAccountAction,
      account,
    });

  it("should render a cta text", () => {
    const { getByText } = renderTestCmp(undefined);

    expect(
      getByText(en.accounts.rename_account_enter_new_name)
    ).toBeInTheDocument();
  });

  it("should not enable rename action if no new name", () => {
    const { getByTestId } = renderTestCmp(undefined);

    const button = getByTestId(
      "confirm-text-input-screen-button"
    ) as HTMLButtonElement;

    expect(button).not.toBeNull();
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should pre-fill input with current sub-account name", async () => {
    const { container } = renderTestCmp(mockSubAccount);

    const { value } = container.querySelector("input") as HTMLInputElement;
    expect(value).not.toBeUndefined();
    expect(value).not.toEqual("");
    expect(value).toEqual(mockSubAccount.name);
  });

  it("should enable and disable action according input", async () => {
    const { container, getByTestId } = renderTestCmp(mockSubAccount);

    const input = container.querySelector("input") as HTMLInputElement;

    const button = getByTestId(
      "confirm-text-input-screen-button"
    ) as HTMLButtonElement;
    expect(button.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, { target: { value: "test" } });
    expect(button.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, { target: { value: "" } });
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should disable action even if text entered if not account", async () => {
    const { container, getByTestId } = renderTestCmp(undefined);

    const input = container.querySelector("input") as HTMLInputElement;
    const button = getByTestId(
      "confirm-text-input-screen-button"
    ) as HTMLButtonElement;

    await fireEvent.input(input, { target: { value: "test" } });

    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should call rename action", async () => {
    const { container, getByTestId } = renderTestCmp(mockSubAccount);

    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "test" } });

    const button = getByTestId(
      "confirm-text-input-screen-button"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    expect(spy).toHaveBeenCalled();
  });
});
