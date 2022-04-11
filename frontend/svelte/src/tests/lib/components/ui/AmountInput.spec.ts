/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import AmountInput from "../../../../lib/components/ui/AmountInput.svelte";
import en from "../../../mocks/i18n.mock";

describe("AmountInput", () => {
  const props = { amount: 10.25, max: 11 };

  it("should render an input", () => {
    const { container } = render(AmountInput, { props });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input?.getAttribute("max")).toEqual("11");
    expect(input?.value).toBe("10.25");
  });

  it("should render a max button", () => {
    const { container } = render(AmountInput, { props });

    const button: HTMLButtonElement | null = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.innerHTML).toEqual(en.core.max);
  });

  it("should trigger max value", (done) => {
    const { container, component } = render(AmountInput, { props });
    component.$on("nnsMax", () => done());

    const button: HTMLButtonElement = container.querySelector(
      "button"
    ) as HTMLButtonElement;
    fireEvent.click(button);
  });
});
