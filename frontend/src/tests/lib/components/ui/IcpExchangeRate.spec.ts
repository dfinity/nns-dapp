import IcpExchangeRate from "$lib/components/ui/IcpExchangeRate.svelte";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import en from "$tests/mocks/i18n.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { IcpExchangeRatePo } from "$tests/page-objects/IcpExchangeRate.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IcpExchangeRate", () => {
  const renderComponent = ({
    hasError,
    placeholderValue,
  }: {
    hasError: boolean;
    placeholderValue?: string;
  }) => {
    const { container } = render(IcpExchangeRate, {
      hasError,
      placeholderValue,
    });

    return IcpExchangeRatePo.under(new JestPageObjectElement(container));
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

  it("displays default placeholder when price is not available", async () => {
    const usdPrice = undefined;
    setIcpPrice(usdPrice);

    const po = renderComponent({ hasError: false });

    expect(await po.getIcpPrice()).toEqual("-/-");
  });

  it("displays provided placeholder when price is not available", async () => {
    const usdPrice = undefined;
    setIcpPrice(usdPrice);

    const po = renderComponent({ hasError: false, placeholderValue: "N/A" });

    expect(await po.getIcpPrice()).toEqual("N/A");
  });

  it("displays formatted price when available", async () => {
    const usdPrice = 10;
    setIcpPrice(usdPrice);

    const po = renderComponent({ hasError: false });

    expect(await po.getIcpPrice()).toEqual("10.00");
  });

  it("shows error message in tooltip when hasError is true", async () => {
    const po = renderComponent({ hasError: true });
    const message = en.accounts.token_price_error;

    expect(await po.getTooltipText()).toEqual(message);
  });

  it("shows price source message in tooltip when hasError is false", async () => {
    const usdPrice = 10;
    setIcpPrice(usdPrice);

    const po = renderComponent({ hasError: false });
    const message = `1 ICP = $10.00 ${en.accounts.token_price_source}`;

    expect(await po.getTooltipText()).toEqual(message);
  });
});
