/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SelectAccount from "../../../../lib/components/accounts/SelectAccount.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

describe("SelectAccount", () => {
  it("should render a spinner until accounts loaded", () => {
    const { container } = render(SelectAccount);

    expect(container.querySelector('[data-tid="spinner"]')).toBeInTheDocument();
  });

  it("should render list of accounts once loaded", () => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());

    const { getByText } = render(SelectAccount);

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render no title per default", () => {
    const { queryByText } = render(SelectAccount);

    expect(queryByText(en.accounts.my_accounts)).not.toBeInTheDocument();
  });

  it("should render a title", () => {
    const { queryByText } = render(SelectAccount, {
      props: { displayTitle: true },
    });

    expect(queryByText(en.accounts.my_accounts)).toBeInTheDocument();
  });
});
