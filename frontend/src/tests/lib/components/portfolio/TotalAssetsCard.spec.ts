import TotalAssetsCard from "$lib/components/portfolio/TotalAssetsCard.svelte";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import en from "$tests/mocks/i18n.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { TotalAssetsCardPo } from "$tests/page-objects/TotalAssetsCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("UsdValueBanner", () => {
  const renderComponent = ({
    usdAmount,
    hasUnpricedTokens,
    isLoading,
  }: {
    usdAmount: number;
    hasUnpricedTokens?: boolean;
    isLoading?: boolean;
  }) => {
    const { container } = render(TotalAssetsCard, {
      usdAmount,
      hasUnpricedTokens,
      isLoading,
    });
    return TotalAssetsCardPo.under(new JestPageObjectElement(container));
  };

  const setIcpPrice = (icpPrice: number) => {
    icpSwapTickersStore.set([
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        last_price: String(icpPrice),
      },
    ]);
  };

  it("should display the USD amount as absent", async () => {
    const usdAmount = undefined;
    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getPrimaryAmount()).toEqual("$-/-");
  });

  it("should display the USD amount", async () => {
    const usdAmount = 50;
    const icpPrice = 10;

    setIcpPrice(icpPrice);

    const po = renderComponent({ usdAmount, hasUnpricedTokens: false });

    expect(await po.getPrimaryAmount()).toEqual("$50.00");
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

  it("should show a spinner instead of the USD price and a placeholder text for the ICP", async () => {
    const usdAmount = 100;
    const icpPrice = 10;
    const isLoading = true;

    setIcpPrice(icpPrice);

    const po = renderComponent({
      usdAmount,
      isLoading,
    });

    expect(await po.hasSpinner()).toEqual(true);
    expect(await po.getPrimaryAmount()).toBeNull();
    expect(await po.getSecondaryAmount()).toEqual("-/- ICP");
  });

  it("should not show a spinner", async () => {
    const usdAmount = 100;
    const icpPrice = 10;
    const isLoading = false;

    setIcpPrice(icpPrice);

    const po = renderComponent({
      usdAmount,
      isLoading,
    });

    expect(await po.hasSpinner()).toEqual(false);
    expect(await po.getPrimaryAmount()).toEqual("$100.00");
  });
});
