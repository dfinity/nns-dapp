/**
 * @jest-environment jsdom
 */

import { ICP, LedgerCanister } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import NewTransactionReview from "../../../../lib/components/accounts/NewTransactionReview.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import { transactionStore } from "../../../../lib/stores/transaction.store";
import { formatICP } from "../../../../lib/utils/icp.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { MockLedgerCanister } from "../../../mocks/ledger.canister.mock";
import { MockNNSDappCanister } from "../../../mocks/nns-dapp.canister.mock";
import NewTransactionTest from "./NewTransactionTest.svelte";

describe("NewTransactionReview", () => {
  const props = { testComponent: NewTransactionReview };

  const amount = ICP.fromString("10.666") as ICP;

  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();
  const mockNNSDappCanister: MockNNSDappCanister = new MockNNSDappCanister();

  beforeAll(() => {
    transactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: mockSubAccount.identifier,
      amount,
    });

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  afterAll(() => {
    transactionStore.set({
      selectedAccount: undefined,
      destinationAddress: undefined,
      amount: undefined,
    });

    jest.clearAllMocks();
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

  it("should execute transaction to transfer ICP", async () => {
    const spyTransferICP = jest.spyOn(mockLedgerCanister, "transfer");

    const { container } = render(NewTransactionTest, { props });

    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(spyTransferICP).toHaveBeenCalled());
  });

  it("should sync accounts after transaction executed", async () => {
    const spyGetAccount = jest.spyOn(mockNNSDappCanister, "getAccount");

    const { container } = render(NewTransactionTest, { props });

    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(spyGetAccount).toHaveBeenCalled());
  });
});
