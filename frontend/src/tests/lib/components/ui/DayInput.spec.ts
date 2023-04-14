/**
 * @jest-environment jsdom
 */

import DayInput from "$lib/components/ui/DayInput.svelte";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("DayInput", () => {
  it("should render a default name attribute", () => {
    const { container } = render(DayInput);
    expect(container.querySelector("input")?.getAttribute("name")).toEqual(
      "amount"
    );
  });

  it("should render a custom name attribute", () => {
    const { container } = render(DayInput, { props: { name: "custom" } });
    expect(container.querySelector("input")?.getAttribute("name")).toEqual(
      "custom"
    );
  });

  it("should render a default placeholder attribute", () => {
    const { container } = render(DayInput);
    expect(
      container.querySelector("input")?.getAttribute("placeholder")
    ).toEqual(en.core.amount);
  });

  it("should render a custom placeholder attribute", () => {
    const { container } = render(DayInput, {
      props: { placeholderLabelKey: "neurons.dissolve_delay_placeholder" },
    });
    expect(
      container.querySelector("input")?.getAttribute("placeholder")
    ).toEqual(en.neurons.dissolve_delay_placeholder);
  });
});
