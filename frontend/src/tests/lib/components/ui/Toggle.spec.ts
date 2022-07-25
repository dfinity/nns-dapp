/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Toggle from "../../../../lib/components/ui/Toggle.svelte";

describe("Toggle", () => {
  const props = {
    checked: false,
    ariaLabel: "test",
  };

  it("should render an input checkbox", () => {
    const { container } = render(Toggle, { props });

    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.getAttribute("type")).toEqual("checkbox");
  });

  it("should render an aria label", () => {
    const { container } = render(Toggle, { props });

    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toEqual(props.ariaLabel);
  });

  it("should toggle checked", () => {
    const { component, container } = render(Toggle, { props });

    const input = container.querySelector("input") as HTMLInputElement;

    const onToggle = jest.fn();
    component.$on("nnsToggle", onToggle);

    fireEvent.click(input);

    expect(onToggle).toBeCalled();
  });
});
