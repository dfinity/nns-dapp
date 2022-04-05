/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NewTransactionDestination from "../../../../lib/components/accounts/NewTransactionDestination.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

describe("NewTransactionDestination", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

  it("should render an explanation text", () => {
    const { queryByText } = render(NewTransactionDestination);

    expect(
      queryByText(en.accounts.enter_address_or_select)
    ).toBeInTheDocument();
  });

  it("should render an input to enter an address", () => {
    const { container } = render(NewTransactionDestination);

    expect(container.querySelector("input")).not.toBeNull();
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("should render a list of accounts", () => {
    const { getByText } = render(NewTransactionDestination);

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();

    expect(
      getByText(mockSubAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });
});
