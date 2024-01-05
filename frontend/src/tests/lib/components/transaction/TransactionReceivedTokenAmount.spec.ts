import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";
import { formatTokenE8s } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionReceivedTokenAmount", () => {
  const amount = TokenAmount.fromE8s({
    amount: 11_000n,
    token: ICPToken,
  });

  it("should render ICP amount", () => {
    const { getByText } = render(TransactionReceivedTokenAmount, {
      props: { amount },
    });

    expect(
      getByText(
        formatTokenE8s({ value: amount.toE8s(), detailed: "height_decimals" })
      )
    ).toBeInTheDocument();

    expect(getByText(amount.token.symbol)).toBeInTheDocument();
  });

  it("should render amount label", () => {
    const { getByText } = render(TransactionReceivedTokenAmount, {
      props: { amount },
    });

    expect(getByText(en.accounts.received_amount)).toBeInTheDocument();
  });

  it("should render amount estimation label", () => {
    const { getByText } = render(TransactionReceivedTokenAmount, {
      props: { amount, estimation: true },
    });

    expect(getByText(en.accounts.received_amount_notice)).toBeInTheDocument();
  });

  it("should render estimation amount with equals sign", () => {
    const testId = "test-estimation-amount";

    const { getByTestId } = render(TransactionReceivedTokenAmount, {
      props: { amount, estimation: true, testId },
    });

    expect(getByTestId(testId)?.textContent).toContain(
      `${formatTokenE8s({ value: amount.toE8s(), detailed: true })}`
    );
  });
});
