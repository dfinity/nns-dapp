/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { transactionStore } from "../../../../lib/stores/transaction.store";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import NewTransactionAmountTest from "./NewTransactionAmountTest.svelte";

describe("NewTransactionAmount", () => {
  it("should render transaction store information", () => {
    transactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: mockSubAccount.identifier,
    });

    const { getByText } = render(NewTransactionAmountTest);

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();

    expect(
      getByText(mockSubAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render transaction fee information", () => {
    const { getByText } = render(NewTransactionAmountTest);

    expect(getByText("0.00010000 ICP", { exact: false })).toBeInTheDocument();
  });
});
