import AmountInput from "$lib/components/ui/AmountInput.svelte";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { mockCkUSDCToken } from "$tests/mocks/tokens.mock";
import { AmountInputPo } from "$tests/page-objects/AmountInput.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { fireEvent } from "@testing-library/svelte";

describe("AmountInput", () => {
  const props = { amount: 10.25, max: 11 };

  it("should render an input", () => {
    const { container } = render(AmountInput, { props });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input?.getAttribute("max")).toEqual("11");
    expect(input?.value).toBe("10.25");
  });

  it("should render a max button", () => {
    const { container, getByText } = render(AmountInput, { props });

    const button: HTMLButtonElement | null = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(getByText(en.core.max)).toBeInTheDocument();
  });

  it("should trigger max value", () =>
    new Promise<void>((done) => {
      const { container } = render(AmountInput, {
        props,
        events: {
          nnsMax: () => done(),
        },
      });

      const button: HTMLButtonElement = container.querySelector(
        "button"
      ) as HTMLButtonElement;
      fireEvent.click(button);
    }));

  const renderComponent = (props) => {
    const { container } = render(AmountInput, props);
    return AmountInputPo.under(new JestPageObjectElement(container));
  };

  it("should allow at most 8 decimals", async () => {
    const po = renderComponent({});

    // 8 decimals works
    await po.getTextInput().typeText("0.12345678");
    expect(await po.getAmount()).toBe("0.12345678");

    // typing one more decimal does not change the input
    await po.getTextInput().typeText("0.123456789");
    expect(await po.getAmount()).toBe("0.12345678");
  });

  it("should allow at most 6 decimals for ckUSDC", async () => {
    const po = renderComponent({ token: mockCkUSDCToken });

    // 6 decimals works
    await po.getTextInput().typeText("0.123456");
    expect(await po.getAmount()).toBe("0.123456");

    // typing one more decimal does not change the input
    await po.getTextInput().typeText("0.1234567");
    expect(await po.getAmount()).toBe("0.123456");
  });

  it("should allow at most 8 decimals even if the token allows more", async () => {
    expect(mockCkETHToken.decimals).toBeGreaterThan(8);

    const po = renderComponent({ token: mockCkETHToken });

    // 8 decimals works
    await po.getTextInput().typeText("0.12345678");
    expect(await po.getAmount()).toBe("0.12345678");

    // typing one more decimal does not change the input
    await po.getTextInput().typeText("0.123456789");
    expect(await po.getAmount()).toBe("0.12345678");
  });
});
