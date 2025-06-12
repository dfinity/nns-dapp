import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatTokenE8s } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionReceivedTokenAmount", () => {
  const amount = TokenAmount.fromE8s({
    amount: 11_000_000n,
    token: ICPToken,
  });
  const renderComponent = (
    props: {
      amount: TokenAmount;
      estimation?: boolean;
      withFiatValue?: boolean;
      testId?: string;
    } = {
      amount,
    }
  ) => {
    return render(TransactionReceivedTokenAmount, props);
  };

  it("should render ICP amount", () => {
    const { getByText } = renderComponent();

    expect(
      getByText(
        formatTokenE8s({ value: amount.toE8s(), detailed: "height_decimals" })
      )
    ).toBeInTheDocument();

    expect(getByText(amount.token.symbol)).toBeInTheDocument();
  });

  it("should render amount label", () => {
    const { getByText } = renderComponent();

    expect(getByText(en.accounts.received_amount)).toBeInTheDocument();
  });

  it("should render amount estimation label", () => {
    const { getByText } = renderComponent({ amount, estimation: true });

    expect(getByText(en.accounts.received_amount_notice)).toBeInTheDocument();
  });

  it("should render estimation amount with equals sign", () => {
    const testId = "test-estimation-amount";
    const { getByTestId } = renderComponent({
      amount,
      estimation: true,
      testId,
    });

    expect(getByTestId(testId)?.textContent).not.toContain("(~$)");
    expect(getByTestId(testId)?.textContent).toContain(
      `${formatTokenE8s({ value: amount.toE8s(), detailed: true })}`
    );
  });

  it("should render fiat value", () => {
    const token = {
      name: "Internet Computer",
      symbol: "ICP",
      decimals: 8,
      fee: 10_000n,
    };
    tokensStore.setToken({
      canisterId: LEDGER_CANISTER_ID,
      token,
      certified: true,
    });
    const ckusdcTicker = {
      ...mockIcpSwapTicker,
      base_id: CKUSDC_LEDGER_CANISTER_ID.toText(),
      last_price: "12.4",
    };
    icpSwapTickersStore.set([ckusdcTicker]);

    const testId = "fiat-value";
    const { getByTestId } = renderComponent({
      amount,
      withFiatValue: true,
    });

    expect(getByTestId(testId)?.textContent).toContain("(~$1.36)");
  });
});
