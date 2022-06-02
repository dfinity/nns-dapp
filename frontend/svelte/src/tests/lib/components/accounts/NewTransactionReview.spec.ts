/**
 * @jest-environment jsdom
 */

import { ICP, LedgerCanister } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import NewTransactionReview from "../../../../lib/components/accounts/NewTransactionReview.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { authStore } from "../../../../lib/stores/auth.store";
import { formatICP } from "../../../../lib/utils/icp.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { MockLedgerCanister } from "../../../mocks/ledger.canister.mock";
import { MockNNSDappCanister } from "../../../mocks/nns-dapp.canister.mock";
import { mockTransactionStore } from "../../../mocks/transaction.store.mock";
import NewTransactionTest from "./NewTransactionTest.svelte";

describe("NewTransactionReview", () => {
  const props = { testComponent: NewTransactionReview };

  const amount = ICP.fromString("10.67") as ICP;

  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();
  const mockNNSDappCanister: MockNNSDappCanister = new MockNNSDappCanister();

  beforeAll(() => {
    mockTransactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: mockSubAccount.identifier,
      amount,
    });

    accountsStore.set({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: undefined,
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
    mockTransactionStore.set({
      selectedAccount: undefined,
      destinationAddress: undefined,
      amount: undefined,
    });

    accountsStore.reset();

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
    expect(icp?.innerHTML).toEqual(`${formatICP({value: amount.toE8s()})}`);
  });

  it("should execute transaction to transfer ICP", async () => {
    const spyTransferICP = jest.spyOn(mockLedgerCanister, "transfer");

    const { container } = render(NewTransactionTest, { props });

    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(button.hasAttribute("disabled")).toBeTruthy());
    await waitFor(() => expect(spyTransferICP).toHaveBeenCalled());
  });

  it("should call complete callback", async () => {
    const spyTransferICP = jest.spyOn(mockLedgerCanister, "transfer");

    const completeTransactionSpy = jest.fn().mockResolvedValue(undefined);
    const { container } = render(NewTransactionTest, {
      props: { ...props, onTransactionComplete: completeTransactionSpy },
    });

    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(button.hasAttribute("disabled")).toBeTruthy());
    await waitFor(() => expect(spyTransferICP).toHaveBeenCalled());
    await waitFor(() => expect(completeTransactionSpy).toHaveBeenCalled());
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
