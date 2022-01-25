/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Modal from "../../../lib/modals/Modal.svelte";

describe("Modal", () => {
  const props: { visible: boolean } = { visible: true };

  it("should display modal", () => {
    const { container, rerender } = render(Modal, {
      props: { visible: false },
    });

    expect(container.querySelector("div.modal")).toBeNull();

    rerender({
      props: { visible: true },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render a backdrop", () => {
    const { container } = render(Modal, {
      props,
    });

    const backdrop: HTMLDivElement | null =
      container.querySelector("div.backdrop");

    expect(backdrop).not.toBeNull();
  });

  it("should render a wrapper", () => {
    const { container } = render(Modal, {
      props,
    });

    const wrapper: HTMLDivElement | null =
      container.querySelector("div.wrapper");

    expect(wrapper).not.toBeNull();
  });

  it("should render a toolbar", () => {
    const { container } = render(Modal, {
      props,
    });

    const toolbar: HTMLDivElement | null =
      container.querySelector("div.toolbar");

    expect(toolbar).not.toBeNull();
    expect(toolbar.querySelector("h2")).not.toBeNull();
    expect(toolbar.querySelector("button")).not.toBeNull();
  });

  it("should render a content", () => {
    const { container } = render(Modal, {
      props,
    });

    const content: HTMLDivElement | null =
      container.querySelector("div.content");

    expect(content).not.toBeNull();
  });

  it("should trigger close modal on click on backdrop", (done) => {
    const { container, component } = render(Modal, {
      props,
    });

    component.$on("close", (e) => {
      done();
    });

    const backdrop: HTMLDivElement | null =
      container.querySelector("div.backdrop");
    fireEvent.click(backdrop);
  });

  it("should trigger close modal on click on close button", (done) => {
    const { container, component } = render(Modal, {
      props,
    });

    component.$on("close", (e) => {
      done();
    });

    const button: HTMLButtonElement | null = container.querySelector("button");
    fireEvent.click(button);
  });
});
