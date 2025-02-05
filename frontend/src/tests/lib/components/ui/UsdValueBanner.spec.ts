import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
import en from "$tests/mocks/i18n.mock";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import { render } from "$tests/utils/svelte.test-utils";

describe("UsdValueBanner", () => {
  const renderComponent = ({
    usdAmount,
    hasUnpricedTokens,
  }: {
    usdAmount: number;
    hasUnpricedTokens: boolean;
  }) => {
    const { container } = render(UsdValueBanner, {
      usdAmount,
      hasUnpricedTokens,
    });
    return UsdValueBannerPo.under(new JestPageObjectElement(container));
  };

  it("should display the USD amount", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getPrimaryAmount()).toEqual("$50.00");
  });

  it("should display the USD amount as absent", async () => {
    const usdAmount = undefined;
    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getPrimaryAmount()).toEqual("$-/-");
  });

  it("should display the ICP amount", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getSecondaryAmount()).toEqual("5.00 ICP");
  });

  it("should display the ICP amount as absent without exchange rates", async () => {
    const usdAmount = 50;
    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getSecondaryAmount()).toEqual("-/- ICP");
  });

  it("should display the ICP price", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getIcpPrice()).toEqual("10.00");
  });

  it("should display the ICP price as absent without exchange rates", async () => {
    const usdAmount = 50;
    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getIcpPrice()).toEqual("-/-");
  });

  it("should display the ICP price in the tooltip", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });
    const message = `1 ICP = $10.00 ${en.accounts.token_price_source}`;

    expect(await po.getIcpExchangeRatePo().getTooltipText()).toEqual(message);
  });

  it("should not have an error by default", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.hasError()).toBe(false);
  });

  it("should have an error without ICP price", async () => {
    const usdAmount = 50;
    const icpPrice = 0;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });
    const message = en.accounts.token_price_error;

    expect(await po.hasError()).toBe(true);
    expect(await po.getIcpExchangeRatePo().getTooltipText()).toEqual(message);
  });

  it("should show a tooltip about unpriced tokens", async () => {
    const hasUnpricedTokens = true;
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens });

    expect(await po.getTotalsTooltipIconPo().isPresent()).toBe(
      hasUnpricedTokens
    );
  });

  it("should not show a tooltip about unpriced tokens", async () => {
    const hasUnpricedTokens = false;
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens });

    expect(await po.getTotalsTooltipIconPo().isPresent()).toBe(
      hasUnpricedTokens
    );
  });
});
