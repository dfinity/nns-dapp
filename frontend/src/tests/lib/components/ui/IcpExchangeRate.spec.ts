import IcpExchangeRate from "$lib/components/ui/IcpExchangeRate.svelte";
import en from "$tests/mocks/i18n.mock";
import { IcpExchangeRatePo } from "$tests/page-objects/IcpExchangeRate.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IcpExchangeRate", () => {
  const renderComponent = ({
    icpPrice,
    hasError,
    absentValue,
  }: {
    icpPrice: number;
    hasError: boolean;
    absentValue?: string;
  }) => {
    const { container } = render(IcpExchangeRate, {
      icpPrice,
      hasError,
      absentValue,
    });

    return IcpExchangeRatePo.under(new JestPageObjectElement(container));
  };

  it("displays default placeholder when price is not available", async () => {
    const icpPrice = undefined;
    const hasError = false;

    const po = renderComponent({ icpPrice, hasError });

    expect(await po.getIcpPrice()).toEqual("-/-");
  });

  it("displays provided placeholder when price is not available", async () => {
    const icpPrice = undefined;
    const absentValue = "N/A";
    const hasError = false;

    const po = renderComponent({ icpPrice, absentValue, hasError });

    expect(await po.getIcpPrice()).toEqual("N/A");
  });

  it("displays formatted price when available", async () => {
    const icpPrice = 10;
    const hasError = false;

    const po = renderComponent({ icpPrice, hasError });

    expect(await po.getIcpPrice()).toEqual("10.00");
  });

  it("shows error message in tooltip when hasError is true", async () => {
    const icpPrice = undefined;
    const hasError = true;

    const po = renderComponent({ icpPrice, hasError });

    const message = en.accounts.token_price_error;

    expect(await po.getTooltipText()).toEqual(message);
  });

  it("shows price source message in tooltip when hasError is false", async () => {
    const icpPrice = 10;
    const hasError = false;

    const po = renderComponent({ icpPrice, hasError });
    const message = `1 ICP = $10.00 ${en.accounts.token_price_source}`;

    expect(await po.getTooltipText()).toEqual(message);
  });
});
