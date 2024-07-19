import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("AmountDisplay", () => {
  const tokenAmount = TokenAmount.fromE8s({
    amount: 123_456_789_010_000n,
    token: ICPToken,
  });

  const props: { amount: TokenAmount } = {
    amount: tokenAmount,
  };

  const renderComponent = (props) => {
    const { container } = render(AmountDisplay, props);
    return AmountDisplayPo.under(new JestPageObjectElement(container));
  };

  it("should render an token amount", async () => {
    const po = renderComponent(props);
    expect(await po.getAmount()).toEqual("1'234'567.89");
  });

  it("should render an token symbol", async () => {
    const po = renderComponent(props);
    expect(await po.getText()).toEqual("1'234'567.89 ICP");
  });

  it("should render + sign", async () => {
    const po = renderComponent({
      props: {
        ...props,
        sign: "+",
      },
    });
    expect(await po.getText()).toEqual("+1'234'567.89 ICP");
  });

  it("should render - sign", async () => {
    const po = renderComponent({
      props: {
        ...props,
        sign: "-",
      },
    });
    expect(await po.getText()).toEqual("-1'234'567.89 ICP");
  });

  it("should render a detailed token amount", async () => {
    const po = renderComponent({
      props: {
        ...props,
        detailed: true,
      },
    });
    expect(await po.getAmount()).toEqual("1'234'567.8901");
  });
});
