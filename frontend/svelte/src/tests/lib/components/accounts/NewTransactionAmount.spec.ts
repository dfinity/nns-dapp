/**
 * @jest-environment jsdom
 */

import { ICP } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import NewTransactionAmount from "../../../../lib/components/accounts/NewTransactionAmount.svelte";
import { E8S_PER_ICP } from "../../../../lib/constants/icp.constants";
import { transactionStore } from "../../../../lib/stores/transaction.store";
import { formatICP } from "../../../../lib/utils/icp.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import NewTransactionTest from "./NewTransactionTest.svelte";

describe("NewTransactionAmount", () => {
  const props = { testComponent: NewTransactionAmount };

  beforeAll(() => {
    transactionStore.set({
      selectedAccount: mockMainAccount,
      destinationAddress: mockSubAccount.identifier,
      amount: ICP.fromString("10.25") as ICP,
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

  it("should render current balance", () => {
    const { container } = render(NewTransactionTest, { props });

    const icp: HTMLSpanElement | null = container.querySelector(
      '[data-tid="icp-value"]'
    );

    expect(icp?.innerHTML).toEqual(
      `${formatICP(mockMainAccount.balance.toE8s())}`
    );
  });

  it("should render an input for the amount", () => {
    const { container } = render(NewTransactionTest, { props });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("should render an input for the amount that has a max value equals to the source account available funds", () => {
    const { container } = render(NewTransactionTest, { props });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input?.getAttribute("max")).toEqual(
      `${Number(mockMainAccount.balance.toE8s()) / E8S_PER_ICP}`
    );
  });

  it("form should be disabled per default", () => {
    const { container } = render(NewTransactionTest, { props });

    const button: HTMLButtonElement | null = container.querySelector(
      'button[type="submit"]'
    );
    expect(button?.getAttribute("disabled")).not.toBeNull();
  });

  it("form should become enabled if correct amount is entered", async () => {
    const { container } = render(NewTransactionTest, { props });

    const input: HTMLInputElement = container.querySelector(
      "input"
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "1" } });

    await waitFor(() => {
      const button: HTMLButtonElement | null = container.querySelector(
        'button[type="submit"]'
      );
      expect(button?.getAttribute("disabled")).toBeNull();
    });
  });

  it("form should remain disabled if amount surpasses max funds", async () => {
    const { container } = render(NewTransactionTest, { props });

    const input: HTMLInputElement = container.querySelector(
      "input"
    ) as HTMLInputElement;
    await fireEvent.input(input, {
      target: {
        value: `${(Number(mockMainAccount.balance.toE8s()) + 1) / E8S_PER_ICP}`,
      },
    });

    await waitFor(() => {
      const button: HTMLButtonElement | null = container.querySelector(
        'button[type="submit"]'
      );
      expect(button?.getAttribute("disabled")).not.toBeNull();
    });
  });

  it("form submit should update store", async () => {
    const testValue = "1.123";

    const { container } = render(NewTransactionTest, { props });

    const input: HTMLInputElement = container.querySelector(
      "input"
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: testValue } });

    const button: HTMLButtonElement = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    await waitFor(() => {
      expect(button?.getAttribute("disabled")).toBeNull();
    });

    fireEvent.click(button);

    const { amount } = get(transactionStore);
    expect(amount).toEqual(ICP.fromString(testValue));
  });
});
