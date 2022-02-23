/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import AddAccountModal from "../../../lib/modals/AddAccountModal/AddAccountModal.svelte";

const en = require("../../../lib/i18n/en.json");

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

    await fireEvent.click(accountCard.parentElement);

    expect(queryByText(en.accounts.new_linked_account_title)).not.toBeNull();
  });

  it("should have disabled Create neuron button", async () => {
    const { container, queryByText } = render(AddAccountModal);

    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    await fireEvent.click(accountCard.parentElement);

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton).not.toBeNull();
    expect(createButton.getAttribute("disabled")).not.toBeNull();
  });

  it("should have enabled Create neuron button when entering amount", async () => {
    const { container, queryByText } = render(AddAccountModal);

    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    await fireEvent.click(accountCard.parentElement);

    const input = container.querySelector('input[name="newAccount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    await fireEvent.input(input, { target: { value: "test name" } });

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton).not.toBeNull();
    expect(createButton.getAttribute("disabled")).toBeNull();
  });
});
