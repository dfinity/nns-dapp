/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Checkbox from "../../../../lib/components/ui/Checkbox.svelte";

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
  });

  it("should react to checked", () => {
    const { container, rerender } = render(Checkbox, {
      props,
    });

    let input: HTMLInputElement | null = container.querySelector("input");
    expect(input?.checked).toBeTruthy();

    rerender({
      props: { ...props, checked: false },
    });

    input = container.querySelector("input");
    expect(input?.checked).toBeFalsy();
  });

  it("should trigger select on container", (done) => {
    const { container, component } = render(Checkbox, {
      props,
    });

    component.$on("nnsChange", () => {
      done();
    });

    const div: HTMLDivElement | null = container.querySelector("div.checkbox");
    expect(div).not.toBeNull();
    div && fireEvent.click(div);
  });

  it("should trigger select on input", (done) => {
    const { container, component } = render(Checkbox, {
      props,
    });

    component.$on("nnsChange", () => {
      done();
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input).not.toBeNull();
    input && fireEvent.click(input);
  });

  it("should render default class", () => {
    const { container } = render(Checkbox, {
      props,
    });

    const div: HTMLDivElement | null = container.querySelector("div.checkbox");

    expect(div?.classList.contains("light")).toBeTruthy();

    const label: HTMLLabelElement | null = container.querySelector("label");

    expect(label?.classList.contains("inline")).toBeTruthy();
  });

  it("should render a dark container", () => {
    const { container } = render(Checkbox, {
      props: { ...props, theme: "dark" },
    });

    const div: HTMLDivElement | null = container.querySelector("div.checkbox");

    expect(div?.classList.contains("dark")).toBeTruthy();
  });

  it("should render block label", () => {
    const { container } = render(Checkbox, {
      props: { ...props, text: "block" },
    });

    const label: HTMLLabelElement | null = container.querySelector("label");

    expect(label?.classList.contains("block")).toBeTruthy();
  });

  it("should apply ref to container", () => {
    const { container } = render(Checkbox, {
      props: { ...props, selector: "test" },
    });

    const div: HTMLDivElement | null = container.querySelector("div.checkbox");

    expect(div?.classList.contains("test")).toBeTruthy();
  });
});
