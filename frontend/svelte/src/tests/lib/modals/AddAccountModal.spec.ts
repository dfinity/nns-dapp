/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import AddAccountModal from "../../../lib/modals/accounts/AddAccountModal.svelte";
import { addSubAccount } from "../../../lib/services/accounts.services";
import en from "../../mocks/i18n.mock";

// This is the way to mock when we import in a destructured manner
// and we want to mock the imported function
jest.mock("../../../lib/services/accounts.services", () => {
  return {
    addSubAccount: jest.fn().mockResolvedValue(undefined),
  };
});

describe("AddAccountModal", () => {
  it("should display modal", () => {
    const { container } = render(AddAccountModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display two button cards", () => {
    const { container } = render(AddAccountModal);

    const buttons = container.querySelectorAll('div[role="button"]');
    expect(buttons.length).toEqual(2);
  });

  it("should be able to select new account ", async () => {
    const { queryByText } = render(AddAccountModal);

    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    expect(queryByText(en.accounts.new_linked_account_title)).not.toBeNull();
  });

  it("should have disabled Add Account button", async () => {
    const { container, queryByText } = render(AddAccountModal);

    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have enabled Add Account button when entering name", async () => {
    const { container, queryByText } = render(AddAccountModal);

    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    const input = container.querySelector('input[name="newAccount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: "test name" } }));

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton?.getAttribute("disabled")).toBeNull();
  });

  it("should create a subaccount", async () => {
    const { container, queryByText } = render(AddAccountModal);

    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    const input = container.querySelector('input[name="newAccount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: "test name" } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    expect(addSubAccount).toBeCalled();
  });
});
