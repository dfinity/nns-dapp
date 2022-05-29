/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import NewTransactionDestination from "../../../../lib/components/accounts/NewTransactionDestination.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockTransactionStore } from "../../../mocks/transaction.store.mock";
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
    mockTransactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: undefined,
      amount: undefined,
    })
  );

  afterAll(() =>
    mockTransactionStore.set({
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

  it("should select an address", async () => {
    const spyOnNext = jest.fn();

    const { container } = render(NewTransactionTest, {
      props: {
        ...props,
        nextCallback: spyOnNext,
      },
    });

    const mainAccount = container.querySelector(
      'article[role="button"]:first-of-type'
    ) as HTMLButtonElement;
    fireEvent.click(mainAccount);

    await waitFor(() => expect(spyOnNext).toHaveBeenCalled());
  });
});
