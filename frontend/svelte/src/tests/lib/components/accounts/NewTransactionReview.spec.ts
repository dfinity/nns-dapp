/**
 * @jest-environment jsdom
 */

import { ICP } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NewTransactionReview from "../../../../lib/components/accounts/NewTransactionReview.svelte";
import { transactionStore } from "../../../../lib/stores/transaction.store";
import { formatICP } from "../../../../lib/utils/icp.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import NewTransactionTest from "./NewTransactionTest.svelte";

describe("NewTransactionReview", () => {
  const props = { testComponent: NewTransactionReview };

  const amount = ICP.fromString("10.666") as ICP;

  beforeAll(() => {
    transactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: mockSubAccount.identifier,
      amount,
    });
  });

  afterAll(() => {
    transactionStore.set({
      selectedAccount: undefined,
      destinationAddress: undefined,
      amount: undefined,
    });
  });

  it("should render a source transaction", () => {
    const { getByText } = render(NewTransactionTest, { props });

    // More tests about details are provided in NewTransactionInfo.spec.ts
    expect(getByText(en.accounts.source)).toBeTruthy();
  });

  it("should render the amount the user has entered", () => {
    const { queryByTestId } = render(NewTransactionTest, { props });

    const icp: HTMLSpanElement | null = queryByTestId("icp-value");
    expect(icp?.innerHTML).toEqual(`${formatICP(amount.toE8s())}`);
  });
});
