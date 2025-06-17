import TransactionSummary from "$lib/components/transaction/TransactionSummary.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatTokenE8s, numberToE8s } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { TransactionSummaryPo } from "$tests/page-objects/TransactionSummary.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionSummary", () => {
  const renderComponent = (props) => {
    const { container } = render(TransactionSummary, {
      props,
    });

    return TransactionSummaryPo.under(new JestPageObjectElement(container));
  };
  const amount = 123456.789;
  const token = ICPToken;
  const transactionFee = TokenAmount.fromE8s({
    amount: 10_000n,
    token,
  });

  const props = {
    amount,
    token,
    transactionFee,
    receivedAmount: createMockSnippet(),
  };

  const e8s = numberToE8s(amount);

  it("should render sending amount", async () => {
    const po = renderComponent(props);

    const { label, amount } = await po.getTransactionSummarySendignAmount();

    expect(label).toEqual(en.accounts.sending_amount);
    expect(amount).toEqual(
      `${formatTokenE8s({ value: e8s, detailed: true })} ${token.symbol}`
    );
  });

  it("should render transaction fee", async () => {
    const po = renderComponent(props);

    const { label, amount } = await po.getTransactionFee();

    const expectedLabel = replacePlaceholders(
      en.accounts.token_transaction_fee,
      {
        $tokenSymbol: token.symbol,
      }
    );

    expect(label).toEqual(expectedLabel);
    expect(amount).toEqual(
      `${formatTokenE8s({
        value: transactionFee.toE8s(),
        detailed: true,
      })} ${token.symbol}`
    );
  });

  it("should render total deducted", async () => {
    const po = renderComponent(props);

    const { label, amount } = await po.getTransactionSummaryTotalDeducted();

    expect(label).toEqual(en.accounts.total_deducted);
    expect(amount).toEqual(
      `${formatTokenE8s({
        value: e8s + transactionFee.toE8s(),
        detailed: true,
      })} ${token.symbol}`
    );
  });

  it("should display fiat values when conversion is available", async () => {
    setIcpPrice(10);

    const po = renderComponent(props);

    expect((await po.getTransactionSummarySendignAmount()).amount).toEqual(
      `123'456.789 ICP(~$1’234’567.89)`
    );
    expect((await po.getTransactionFee()).amount).toEqual(
      `0.0001 ICP(< $0.01)`
    );
    expect((await po.getTransactionSummaryTotalDeducted()).amount).toEqual(
      `123'456.7891 ICP(~$1’234’567.89)`
    );
  });
});
