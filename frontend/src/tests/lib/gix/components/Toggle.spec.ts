import Toggle from "$lib/gix/components/Toggle.svelte";
import { render } from "$tests/lib/gix/test-utils/render.test-utils";
import { fireEvent } from "@testing-library/svelte";

describe("Toggle", () => {
  const props = {
    checked: false,
    ariaLabel: "test",
    testId: "toogle-test",
  };

  it("should render a toggle", () => {
    const { getByTestId } = render(Toggle, { props });

    expect(getByTestId(props.testId)).not.toBeNull();
  });

  it("should render an input checkbox", () => {
    const { container } = render(Toggle, { props });

    const input = container.querySelector("input") as HTMLInputElement;

    expect(input).not.toBeNull();
    expect(input.getAttribute("type")).toEqual("checkbox");
  });

  it("should render a checkbox enabled", () => {
    const { container } = render(Toggle, { props });

    const input = container.querySelector("input") as HTMLInputElement;

    expect(input?.hasAttribute("disabled")).toBeFalsy();
  });

  it("should render a checkbox disabled", () => {
    const { container } = render(Toggle, {
      props: {
        ...props,
        disabled: true,
      },
    });

    const input = container.querySelector("input") as HTMLInputElement;

    expect(input?.hasAttribute("disabled")).toBeTruthy();
  });

  it("should render an aria label", () => {
    const { container } = render(Toggle, { props });

    const input = container.querySelector("input") as HTMLInputElement;

    expect(input.getAttribute("aria-label")).toEqual(props.ariaLabel);
  });

  it("should toggle checked", () => {
    const onToggle = vi.fn();

    const { container } = render(Toggle, {
      props,
      events: {
        nnsToggle: onToggle,
      },
    });

    const input = container.querySelector("input") as HTMLInputElement;

    fireEvent.click(input);

    expect(onToggle).toHaveBeenCalled();
  });
});
