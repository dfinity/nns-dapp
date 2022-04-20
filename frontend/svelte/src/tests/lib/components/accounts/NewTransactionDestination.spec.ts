/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NewTransactionDestination from "../../../../lib/components/accounts/NewTransactionDestination.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { transactionStore } from "../../../../lib/stores/transaction.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import NewTransactionTest from "./NewTransactionTest.svelte";

describe("NewTransactionDestination", () => {
  const props = { testComponent: NewTransactionDestination };

  const mockSubAccount2 = {
    ...mockSubAccount,
    identifier: `test-identifier`,
  };

  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount, mockSubAccount2])
    );

  beforeAll(() =>
    transactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: undefined,
      amount: undefined,
    })
  );

  afterAll(() =>
    transactionStore.set({
      selectedAccount: undefined,
      destinationAddress: undefined,
      amount: undefined,
    })
  );

  it("should render an explanation text", () => {
    const { queryByText } = render(NewTransactionTest, {
      props,
    });

    expect(
      queryByText(en.accounts.enter_address_or_select)
    ).toBeInTheDocument();
  });

  it("should render an input to enter an address", () => {
    const { container } = render(NewTransactionTest, {
      props,
    });

    expect(container.querySelector("input")).not.toBeNull();
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("should render a list of accounts", () => {
    const { getByText } = render(NewTransactionTest, {
      props,
    });

    expect(
      getByText(mockSubAccount.identifier, { exact: false })
    ).toBeInTheDocument();

    expect(
      getByText(mockSubAccount2.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should filter selected account", () => {
    const { getByText } = render(NewTransactionTest, {
      props,
    });

    expect(() =>
      getByText(mockMainAccount.identifier, { exact: false })
    ).toThrow();
  });
});
