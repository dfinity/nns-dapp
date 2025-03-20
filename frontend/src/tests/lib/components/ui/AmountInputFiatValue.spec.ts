import AmountInputFiatValue from "$lib/components/ui/AmountInputFiatValue.svelte";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import en from "$tests/mocks/i18n.mock";
import { AmountInputFiatValuePo } from "$tests/page-objects/AmountInputFiatValue.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import { ICPToken } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("AmountInputFiatValue", () => {
  const renderComponent = (props: {
    amount?: number;
    token: typeof ICPToken;
    balance?: bigint;
    errorState?: boolean;
  }) => {
    const { container } = render(AmountInputFiatValue, {
      props,
    });
    return AmountInputFiatValuePo.under(new JestPageObjectElement(container));
  };

  it("should display 0 USD when no amount is provided", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      token: ICPToken,
    });

    expect(await po.getFiatValue()).toBe("$0.00");
  });

  it("should display the USD value correctly", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5_000,
      token: ICPToken,
    });

    expect(await po.getFiatValue()).toBe("$50’000.00");
  });

  it("should not display balance when balance prop is not provided", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
    });

    expect(await po.hasBalance()).toBe(false);
  });

  it("should display balance when balance prop is provided", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
      balance: 1000000000n,
    });

    expect(await po.hasBalance()).toBe(true);
    expect(await po.getBalancePo().getText()).toBe("10.00 ICP");
  });

  it("should apply error class when errorState is true", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
      balance: BigInt(1000000000),
      errorState: true,
    });

    expect(await po.hasError()).toBe(true);
  });

  it("should not apply error class when errorState is false", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
      balance: BigInt(1000000000),
      errorState: false,
    });

    expect(await po.hasError()).toBe(false);
  });

  it("should show tooltip message with the source of the conversion", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
      balance: BigInt(1000000000),
      errorState: true,
    });

    expect(await po.getTooltipIconPo().getTooltipText()).toEqual(
      en.accounts.token_price_source
    );
  });

  it("should show tooltip message with an error if tokenPrice is not available", async () => {
    setIcpPrice(0);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
      balance: BigInt(1000000000),
      errorState: false,
    });

    expect(await po.getTooltipIconPo().getTooltipText()).toEqual(
      en.accounts.token_price_error
    );
  });

  it("should show tooltip message with an error if icp-swap is not responding", async () => {
    icpSwapTickersStore.set("error");

    const po = renderComponent({
      amount: 5,
      token: ICPToken,
      balance: BigInt(1000000000),
      errorState: false,
    });

    expect(await po.getTooltipIconPo().getTooltipText()).toEqual(
      en.accounts.token_price_error
    );
  });

  it("should update USD value when amount changes", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
    });

    expect(await po.getFiatValue()).toBe("$50.00");

    const updatedPo = renderComponent({
      amount: 10,
      token: ICPToken,
    });

    expect(await updatedPo.getFiatValue()).toBe("$100.00");
  });

  it("should update USD value when token price changes", async () => {
    setIcpPrice(10);
    const po = renderComponent({
      amount: 5,
      token: ICPToken,
    });

    expect(await po.getFiatValue()).toBe("$50.00");

    setIcpPrice(20);
    const updatedPo = renderComponent({
      amount: 5,
      token: ICPToken,
    });

    expect(await updatedPo.getFiatValue()).toBe("$100.00");
  });
});
