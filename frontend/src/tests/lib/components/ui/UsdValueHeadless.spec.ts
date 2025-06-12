import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import UsdValueHeadlessTest from "$tests/lib/components/ui/UsdValueHeadlessTest.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { UsdValueHeadlessPo } from "$tests/page-objects/UsdValueHeadless.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { tick } from "svelte";

describe("UsdValueHeadless", () => {
  const renderComponent = ({
    usdAmount,
    hasUnpricedTokens,
    absentValue,
  }: {
    usdAmount: number;
    hasUnpricedTokens: boolean;
    absentValue?: string;
  }) => {
    const { container } = render(UsdValueHeadlessTest, {
      usdAmount,
      hasUnpricedTokens,
      absentValue,
    });

    return UsdValueHeadlessPo.under(new JestPageObjectElement(container));
  };

  it("should handle undefined usdAmount", async () => {
    setIcpPrice(100);

    const po = renderComponent({
      usdAmount: undefined,
      hasUnpricedTokens: false,
    });

    expect(await po.getUsdAmountFormatted()).toBe("-/-");
    expect(await po.getIcpAmountFormatted()).toBe("-/-");
    expect(await po.getHasError()).toBe("false");
    expect(await po.getHasPricesAndUnpricedTokens()).toBe("false");
  });

  it("should handle override absent value", async () => {
    setIcpPrice(100);

    const po = renderComponent({
      usdAmount: undefined,
      hasUnpricedTokens: false,
      absentValue: "N/A",
    });

    expect(await po.getUsdAmountFormatted()).toBe("N/A");
    expect(await po.getIcpAmountFormatted()).toBe("N/A");
    expect(await po.getHasError()).toBe("false");
    expect(await po.getHasPricesAndUnpricedTokens()).toBe("false");
  });

  it("should display formatted values when prices are available", async () => {
    setIcpPrice(100);

    const po = renderComponent({
      usdAmount: 1000,
      hasUnpricedTokens: false,
    });

    expect(await po.getUsdAmountFormatted()).toBe("1’000");
    expect(await po.getIcpAmountFormatted()).toBe("10.00");
    expect(await po.getHasError()).toBe("false");
    expect(await po.getHasPricesAndUnpricedTokens()).toBe("false");
  });

  it("should handle error state", async () => {
    icpSwapTickersStore.set("error");

    const po = renderComponent({
      usdAmount: 1000,
      hasUnpricedTokens: false,
    });

    expect(await po.getUsdAmountFormatted()).toBe("-/-");
    expect(await po.getIcpAmountFormatted()).toBe("-/-");
    expect(await po.getHasError()).toBe("true");
    expect(await po.getHasPricesAndUnpricedTokens()).toBe("false");
  });

  it("should handle unpriced tokens", async () => {
    setIcpPrice(100);

    const po = renderComponent({
      usdAmount: 1000,
      hasUnpricedTokens: true,
    });

    expect(await po.getUsdAmountFormatted()).toBe("1’000");
    expect(await po.getIcpAmountFormatted()).toBe("10.00");
    expect(await po.getHasError()).toBe("false");
    expect(await po.getHasPricesAndUnpricedTokens()).toBe("true");
  });

  it("should handle price updates", async () => {
    setIcpPrice(100);

    const po = renderComponent({
      usdAmount: 1000,
      hasUnpricedTokens: false,
    });

    expect(await po.getUsdAmountFormatted()).toBe("1’000");
    expect(await po.getIcpAmountFormatted()).toBe("10.00");

    setIcpPrice(200);
    await tick();

    expect(await po.getUsdAmountFormatted()).toBe("1’000");
    expect(await po.getIcpAmountFormatted()).toBe("5.00");
  });

  it("should hide balance if user is logged in and hide balance is toggled", async () => {
    balancePrivacyOptionStore.set("hide");
    resetIdentity();

    const po = renderComponent({
      usdAmount: 1000,
      hasUnpricedTokens: false,
    });

    expect(await po.getUsdAmountFormatted()).toBe("•••••");
    expect(await po.getIcpAmountFormatted()).toBe("•••");
  });
});
