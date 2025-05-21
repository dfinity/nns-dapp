import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import {
  FailedTokenAmount,
  UnavailableTokenAmount,
} from "$lib/utils/token.utils";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
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

  it("should render a token amount", async () => {
    const po = renderComponent(props);
    expect(await po.getAmount()).toEqual("1'234'567.89");
  });

  it("should render a token symbol", async () => {
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

  it("should render failed token amount", async () => {
    const token = {
      ...mockSnsToken,
      symbol: "TOKEN",
    };
    const po = renderComponent({
      amount: new FailedTokenAmount(token),
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

  it("should never render a copy button for failed amount", async () => {
    const po = renderComponent({
      amount: new FailedTokenAmount(ICPToken),
      copy: true,
    });
    expect(await po.getCopyButtonPo().isPresent()).toBe(false);
  });

  it("should render the hidden characters if hideValue is true", async () => {
    resetIdentity();
    balancePrivacyOptionStore.set("hide");

    const po = renderComponent({
      ...props,
      hideValue: true,
    });
    expect(await po.getText()).toEqual("••• ICP");
  });
});
