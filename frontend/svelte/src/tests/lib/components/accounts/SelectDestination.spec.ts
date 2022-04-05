/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SelectDestination from "../../../../lib/components/accounts/SelectDestination.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

describe("SelectDestination", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

  it("should render an explanation text", () => {
    const { queryByText } = render(SelectDestination);

    expect(
      queryByText(en.accounts.enter_address_or_select)
    ).toBeInTheDocument();
  });

  it("should render an input to enter an address", () => {
    const { container } = render(SelectDestination);

    expect(container.querySelector("input")).not.toBeNull();
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("should render a list of accounts", () => {
    const { getByText } = render(SelectDestination);

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();

    expect(
      getByText(mockSubAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });
});
