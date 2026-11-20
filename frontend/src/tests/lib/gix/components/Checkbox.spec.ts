import Checkbox from "$lib/gix/components/Checkbox.svelte";
import { render } from "$tests/lib/gix/test-utils/render.test-utils";
import { fireEvent } from "@testing-library/svelte";

describe("Checkbox", () => {
  const props: { inputId: string; checked: boolean } = {
    inputId: "id",
    checked: true,
  };

  it("should render a container", () => {
    const { container } = render(Checkbox, {
      props,
    });

    expect(container.querySelector("div.checkbox")).not.toBeNull();
  });

  it("should render a label", () => {
    const { container } = render(Checkbox, {
      props,
    });

    const label: HTMLLabelElement | null = container.querySelector("label");

    expect(label?.getAttribute("for")).toEqual(props.inputId);
  });

  it("should render an input", () => {
    const { container } = render(Checkbox, {
      props,
    });

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input?.getAttribute("type")).toEqual("checkbox");
    expect(input?.getAttribute("id")).toEqual(props.inputId);
    expect(input?.hasAttribute("disabled")).toBeFalsy();
  });

  it("should render a disabled input", () => {
    const { container } = render(Checkbox, {
      props: { ...props, disabled: true },
    });

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input?.hasAttribute("disabled")).toBeTruthy();
  });

  it("should react to checked", async () => {
    const { container, rerender } = render(Checkbox, {
      props,
    });

    let input: HTMLInputElement | null = container.querySelector("input");

    expect(input?.checked).toBeTruthy();

    await rerender({ ...props, checked: false });

    input = container.querySelector("input");

    expect(input?.checked).toBeFalsy();
  });

  it("should trigger select on container", () =>
    new Promise<void>((done) => {
      const { container } = render(Checkbox, {
        props,
        events: {
          nnsChange: () => done(),
        },
      });

      const div: HTMLDivElement | null =
        container.querySelector("div.checkbox");

      expect(div).not.toBeNull();

      div && fireEvent.click(div);
    }));

  it("should trigger select on input", () =>
    new Promise<void>((done) => {
      const { container } = render(Checkbox, {
        props,
        events: {
          nnsChange: () => done(),
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      expect(input).not.toBeNull();

      input && fireEvent.click(input);
    }));

  it("should render default class", () => {
    const { container } = render(Checkbox, {
      props,
    });

    const label: HTMLLabelElement | null = container.querySelector("label");

    expect(label?.classList.contains("inline")).toBeTruthy();
  });

  it("should render block label", () => {
    const { container } = render(Checkbox, {
      props: { ...props, text: "block" },
    });

    const label: HTMLLabelElement | null = container.querySelector("label");

    expect(label?.classList.contains("block")).toBeTruthy();
  });

  it("should not trigger nnsChange event when disabled and clicked", async () => {
    const mockChange = vi.fn();
    const { container } = render(Checkbox, {
      props: {
        ...props,
        disabled: true,
      },
      events: {
        nnsChange: mockChange,
      },
    });

    await fireEvent.click(container.querySelector("div.checkbox") as Element);

    expect(mockChange).not.toHaveBeenCalled();
  });

  it("should not trigger nnsChange event when disabled and key pressed", async () => {
    const mockChange = vi.fn();
    const { container } = render(Checkbox, {
      props: {
        ...props,
        disabled: true,
      },
      events: {
        nnsChange: mockChange,
      },
    });

    await fireEvent.keyPress(
      container.querySelector("div.checkbox") as Element,
      {
        key: "Enter",
        code: "Enter",
      }
    );

    expect(mockChange).not.toHaveBeenCalled();
  });
});
