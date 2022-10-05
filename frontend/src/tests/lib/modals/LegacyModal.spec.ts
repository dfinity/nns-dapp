/**
 * @jest-environment jsdom
 */

import LegacyModal from "$lib/components/modals/LegacyModal.svelte";
import { fireEvent, render } from "@testing-library/svelte";

describe("LegacyModal", () => {
  const props: { visible: boolean } = { visible: true };

  it("should display modal", () => {
    const { container, rerender } = render(LegacyModal, {
      props: { visible: false },
    });

    expect(container.querySelector("div.modal")).toBeNull();

    rerender({
      props: { visible: true },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display a medium size modal", () => {
    const { container } = render(LegacyModal, {
      props: { visible: true, size: "medium" },
    });

    expect(container.querySelector("div.wrapper.medium")).not.toBeNull();
  });

  it("should be an accessible modal", () => {
    const { container } = render(LegacyModal, {
      props: { ...props, showBackButton: true },
    });

    const dialog: HTMLElement | null =
      container.querySelector('[role="dialog"]');

    expect(dialog?.getAttribute("aria-labelledby")).toEqual("modalTitle");
    expect(dialog?.getAttribute("aria-describedby")).toEqual("modalContent");

    expect(container.querySelector("#modalTitle")).not.toBeNull();
    expect(container.querySelector("#modalContent")).not.toBeNull();
  });

  it("should render a backdrop", () => {
    const { container } = render(LegacyModal, {
      props,
    });

    const backdrop: HTMLDivElement | null =
      container.querySelector("div.backdrop");

    expect(backdrop).not.toBeNull();
  });

  it("should render a wrapper", () => {
    const { container } = render(LegacyModal, {
      props,
    });

    const wrapper: HTMLDivElement | null =
      container.querySelector("div.wrapper");

    expect(wrapper).not.toBeNull();
  });

  it("should render a toolbar", () => {
    const { container } = render(LegacyModal, {
      props: { ...props, showBackButton: true },
    });

    const toolbar: HTMLDivElement | null =
      container.querySelector("div.toolbar");

    expect(toolbar?.querySelector("h3")).not.toBeNull();
    expect(toolbar?.querySelector("button")).not.toBeNull();
  });

  it("should render a content", () => {
    const { container } = render(LegacyModal, {
      props,
    });

    const content: HTMLDivElement | null =
      container.querySelector("div.content");

    expect(content).not.toBeNull();
  });

  it("should trigger close modal on click on backdrop", (done) => {
    const { container, component } = render(LegacyModal, {
      props,
    });

    component.$on("nnsClose", () => {
      done();
    });

    const backdrop: HTMLDivElement | null =
      container.querySelector("div.backdrop");
    backdrop && fireEvent.click(backdrop);
  });

  it("should trigger close modal on click on close button", (done) => {
    const { container, component } = render(LegacyModal, {
      props: { ...props, showBackButton: true },
    });

    component.$on("nnsClose", () => {
      done();
    });

    const button: HTMLButtonElement | null = container.querySelector(
      'button[aria-label="Close"]'
    );
    button && fireEvent.click(button);
  });

  it("should trigger back event on click on back button", (done) => {
    const { container, component } = render(LegacyModal, {
      props: { visible: true, showBackButton: true },
    });

    component.$on("nnsBack", () => {
      done();
    });

    const button: HTMLButtonElement | null = container.querySelector(
      'button[aria-label="Back"]'
    );
    button && fireEvent.click(button);
  });
});
