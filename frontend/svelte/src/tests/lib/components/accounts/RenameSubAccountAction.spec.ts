/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import RenameSubAccountAction from "../../../../lib/components/accounts/RenameSubAccountAction.svelte";
import { renameSubAccount } from "../../../../lib/services/accounts.services";
import type { Account } from "../../../../lib/types/account";
import { mockSubAccount } from "../../../mocks/accounts.store.mock";
import { renderSelectedAccountContext } from "../../../mocks/context-wrapper.mock";
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

    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;

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

    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;
    expect(button.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, { target: { value: "test" } });
    expect(button.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, { target: { value: "" } });
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should disable action even if text entered if not account", async () => {
    const { container, getByTestId } = renderTestCmp(undefined);

    const input = container.querySelector("input") as HTMLInputElement;
    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;

    await fireEvent.input(input, { target: { value: "test" } });

    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("should call rename action", async () => {
    const { container, getByTestId } = renderTestCmp(mockSubAccount);

    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "test" } });

    const button = getByTestId("rename-subaccount-button") as HTMLButtonElement;
    await fireEvent.click(button);

    expect(spy).toHaveBeenCalled();
  });
});
