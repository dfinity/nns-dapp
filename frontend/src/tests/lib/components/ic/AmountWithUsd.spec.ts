import AmountWithUsd from "$lib/components/ic/AmountWithUsd.svelte";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { AmountWithUsdPo } from "$tests/page-objects/AmountWithUsd.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("AmountWithUsd", () => {
  const tokenAmount = TokenAmount.fromE8s({
    amount: 123_456_789_010_000n,
    token: ICPToken,
  });

  const renderComponent = (props) => {
    const { container } = render(AmountWithUsd, props);
    return AmountWithUsdPo.under(new JestPageObjectElement(container));
  };

  it("should render a token amount", async () => {
    const po = renderComponent({ amount: tokenAmount, amountInUsd: undefined });
    expect(await po.getAmountDisplayPo().getText()).toEqual("1'234'567.89 ICP");
  });

  it("should render an unavailable token amount", async () => {
    const po = renderComponent({
      amount: new UnavailableTokenAmount(ICPToken),
      amountInUsd: undefined,
    });
    expect(await po.getAmountDisplayPo().getText()).toEqual("-/- ICP");
  });

  it("should render an amount in USD", async () => {
    const po = renderComponent({
      amount: tokenAmount,
      amountInUsd: "12345.678",
    });
    expect(await po.getAmountInUsd()).toEqual("$12’345.68");
  });

  it("should render an absent amount in USD", async () => {
    const po = renderComponent({
      amount: tokenAmount,
      amountInUsd: undefined,
    });
    expect(await po.getAmountInUsd()).toEqual("$-/-");
  });
});
