/**
 * @jest-environment jsdom
 */

import TransactionSummary from "$lib/components/transaction/TransactionSummary.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken, numberToE8s } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionSummary", () => {
  const amount = 123456.789;
  const token = ICPToken;
  const transactionFee = TokenAmount.fromE8s({
    amount: BigInt(10_000),
    token,
  });

  const props = {
    amount,
    token,
    transactionFee,
  };

  const e8s = numberToE8s(amount);

  it("should render sending amount", () => {
    const { getByTestId } = render(TransactionSummary, {
      props,
    });

    const block = getByTestId("transaction-summary-sending-amount");

    expect(block.textContent).toContain(en.accounts.sending_amount);
    expect(block.textContent).toContain(
      `${formatToken({ value: e8s, detailed: "height_decimals" })} ${
        token.symbol
      }`
    );
  });

  it("should render transaction fee", () => {
    const { getByTestId } = render(TransactionSummary, {
      props,
    });

    const block = getByTestId("transaction-summary-fee");

    const label = replacePlaceholders(en.accounts.token_transaction_fee, {
      $tokenSymbol: token.symbol,
    });

    expect(block.textContent).toContain(label);
    expect(block.textContent).toContain(
      `${formatToken({
        value: transactionFee.toE8s(),
        detailed: "height_decimals",
      })} ${token.symbol}`
    );
  });

  it("should render total deducted", () => {
    const { getByTestId } = render(TransactionSummary, {
      props,
    });

    const block = getByTestId("transaction-summary-total-deducted");

    expect(block.textContent).toContain(en.accounts.total_deducted);
    expect(block.textContent).toContain(
      `${formatToken({
        value: e8s + transactionFee.toE8s(),
        detailed: "height_decimals",
      })} ${token.symbol}`
    );
  });
});
