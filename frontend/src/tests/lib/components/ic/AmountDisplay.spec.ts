import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
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

  it("should not have a copy button by default", async () => {
    const po = renderComponent(props);
    expect(await po.getCopyButtonPo().isPresent()).toBe(false);
  });

  it("should have a copy button", async () => {
    const po = renderComponent({
      ...props,
      copy: true,
    });
    expect(await po.getCopyButtonPo().isPresent()).toBe(true);
  });

  it("should copy amount to clipboard", async () => {
    const copySpy = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: copySpy,
      },
    });

    const po = renderComponent({
      ...props,
      copy: true,
    });
    expect(copySpy).not.toBeCalled();
    await po.getCopyButtonPo().click();
    expect(copySpy).toBeCalledWith("1'234'567.8901");
    expect(copySpy).toBeCalledTimes(1);
  });

  it("should render unavailable ICP amount", async () => {
    const po = renderComponent({
      amount: new UnavailableTokenAmount(ICPToken),
    });
    expect(await po.getText()).toBe("-/- ICP");
  });

  it("should render unavailable token amount", async () => {
    const token = {
      ...mockSnsToken,
      symbol: "TOKEN",
    };
    const po = renderComponent({
      amount: new UnavailableTokenAmount(token),
    });
    expect(await po.getText()).toBe("-/- TOKEN");
  });

  it("should never render a copy button for unavailable amount", async () => {
    const po = renderComponent({
      amount: new UnavailableTokenAmount(ICPToken),
      copy: true,
    });
    expect(await po.getCopyButtonPo().isPresent()).toBe(false);
  });
});
