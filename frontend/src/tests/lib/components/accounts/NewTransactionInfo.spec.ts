/**
 * @jest-environment jsdom
 */

import { ICP } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NewTransactionInfo from "../../../../lib/components/accounts/NewTransactionInfo.svelte";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockTransactionStore } from "../../../mocks/transaction.store.mock";
import NewTransactionTest from "./NewTransactionTest.svelte";

describe("NewTransactionInfo", () => {
  const props = { testComponent: NewTransactionInfo };

  beforeAll(() => {
    mockTransactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: mockSubAccount.identifier,
      amount: ICP.fromString("10.25") as ICP,
    });
  });

  afterAll(() => {
    mockTransactionStore.set({
      selectedAccount: undefined,
      destinationAddress: undefined,
      amount: undefined,
    });
  });

  it("should render a source transaction", () => {
    const { getByText } = render(NewTransactionTest, { props });

    expect(getByText(en.accounts.source)).toBeTruthy();
    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a destination for the transaction", () => {
    const { getByText } = render(NewTransactionTest, { props });

    expect(getByText(en.accounts.destination)).toBeTruthy();
    expect(
      getByText(mockSubAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render transaction fee information", () => {
    const { getByText } = render(NewTransactionTest, { props });

    expect(getByText(en.accounts.transaction_fee)).toBeTruthy();
    expect(getByText("0.0001", { exact: false })).toBeInTheDocument();
  });

  it("should render hardware wallet information", () => {
    mockTransactionStore.set({
      selectedAccount: mockHardwareWalletAccount,
      destinationAddress: mockSubAccount.identifier,
      amount: ICP.fromString("10.25") as ICP,
    });

    const { getByText } = render(NewTransactionTest, { props });

    expect(
      getByText(en.accounts.hardware_wallet_text, { exact: false })
    ).toBeTruthy();
  });
});
