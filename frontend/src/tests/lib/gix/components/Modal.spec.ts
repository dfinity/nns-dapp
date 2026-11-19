import { startBusy } from "$lib/gix";
import Modal from "$lib/gix/components/Modal.svelte";
import type { ModalProps } from "$lib/gix/types/modal";
import { render } from "$tests/lib/gix/test-utils/render.test-utils";
import { fireEvent } from "@testing-library/svelte";
import { mockSnippet } from "../mocks/snippet.mocks";
import ModalPropagationTest from "./ModalPropagationTest.svelte";
import ModalTest from "./ModalTest.svelte";

describe("Modal", () => {
  const props: ModalProps = { visible: true, children: mockSnippet };

  it("should display modal", async () => {
    const { container, rerender } = render(Modal, {
      props: { visible: false, children: mockSnippet },
    });

    expect(container.querySelector("div.modal")).toBeNull();

    await rerender({ visible: true });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display an alert modal", () => {
    const { container } = render(Modal, {
      props: { visible: true, role: "alert", children: mockSnippet },
    });

    const alert: HTMLElement | null = container.querySelector('[role="alert"]');

    expect(alert).not.toBeNull();
  });

  it("should be an accessible modal", () => {
    const { container } = render(ModalTest, {
      props,
    });

    const dialog: HTMLElement | null =
      container.querySelector('[role="dialog"]');

    expect(
      dialog?.getAttribute("aria-labelledby")?.includes("modal-title-")
    ).toBeTruthy();
    expect(
      dialog?.getAttribute("aria-describedby")?.includes("modal-content-")
    ).toBeTruthy();

    const modalTitleId = dialog?.getAttribute("aria-labelledby") as string;
    const modalContentId = dialog?.getAttribute("aria-describedby") as string;

    expect(container.querySelector(`#${modalTitleId}`)).not.toBeNull();
    expect(container.querySelector(`#${modalContentId}`)).not.toBeNull();
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

  it("should render a subtitle", () => {
    const subTitleString = "My subtitle";
    const { getByText } = render(ModalTest, {
      props: {
        ...props,
        subTitleString,
      },
    });

    expect(getByText(subTitleString)).not.toBeNull();
  });

  it("should render a toolbar", () => {
    const { container } = render(Modal, {
      props,
    });

    const toolbar: HTMLDivElement | null =
      container.querySelector("div.toolbar");

    expect(toolbar?.querySelector("h3")).not.toBeNull();
    expect(toolbar?.querySelector("button")).not.toBeNull();
  });

  it("should render a content", () => {
    const { container } = render(Modal, {
      props,
    });

    const content: HTMLDivElement | null =
      container.querySelector("div.content");

    expect(content).not.toBeNull();
  });

  it("should trigger close modal on click on backdrop", () =>
    new Promise<void>((done) => {
      const { container } = render(Modal, {
        props: {
          ...props,
          onClose: () => done(),
        },
      });

      const backdrop: HTMLDivElement | null =
        container.querySelector("div.backdrop");
      backdrop && fireEvent.click(backdrop);
    }));

  it("should trigger close modal on Esc", () =>
    new Promise<void>((done) => {
      const { container } = render(Modal, {
        props: {
          ...props,
          onClose: () => done(),
        },
      });

      fireEvent.keyDown(container, { key: "Escape" });
    }));

  it("should not close modal on not Esc keypress", () => {
    const { container } = render(Modal, {
      props: {
        ...props,
        onClose: () => {
          throw new Error("Should not close modal");
        },
      },
    });

    fireEvent.keyDown(container, { key: "Enter" });
    fireEvent.keyDown(container, { key: "Backspace" });
  });

  it("should not close modal on Esc when busy = true", () => {
    const { container } = render(Modal, {
      props: {
        ...props,
        onClose: () => {
          throw new Error("Should not close modal");
        },
      },
    });

    startBusy({ initiator: "stake-neuron" });

    fireEvent.keyDown(container, { key: "Escape" });
  });

  it("should not have a data-tid attribute", () => {
    const { container } = render(Modal, {
      props: {
        ...props,
      },
    });

    const modal = container.querySelector("div.modal");

    expect(modal?.getAttribute("data-tid")).toBeNull();
  });

  it("should have a single root with data-tid attribute", () => {
    const testId = "my-test-id";
    const { baseElement } = render(Modal, {
      props: {
        ...props,
        testId,
      },
    });

    // Make sure the data-tid encloses everything in the component.
    expect(baseElement.firstElementChild?.children.length).toBe(1);

    const modal = baseElement.firstElementChild?.firstElementChild;

    expect(modal?.className).toContain("modal");
    expect(modal?.getAttribute("data-tid")).toBe(testId);
  });

  it("should trigger close modal on click on close button", () =>
    new Promise<void>((done) => {
      const { getByTestId } = render(ModalTest, {
        props: {
          ...props,
          onClose: () => done(),
        },
      });

      const button: HTMLElement | null = getByTestId("close-modal");

      expect(button).not.toBeNull();
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
    }));

  it("should not trigger close modal on click on backdrop", () => {
    const { getByTestId } = render(ModalTest, {
      props: {
        ...props,
        disablePointerEvents: true,
      },
    });

    expect(() => getByTestId("close-modal")).toThrow();
  });

  it("should render header-left and header-right slots", () => {
    const { container } = render(ModalTest, { props: { ...props } });

    const headerLeftElement = container.querySelector(
      '[data-tid="header-left-content"]'
    );
    const headerRightElement = container.querySelector(
      '[data-tid="header-right-content"]'
    );

    expect(headerLeftElement).not.toBeNull();
    expect(headerLeftElement?.textContent).toBe("Left Header Content");
    expect(headerRightElement).not.toBeNull();
    expect(headerRightElement?.textContent).toBe("Right Header Content");
  });

  it("should stop the propagation of the click event", async () => {
    const onParentClick = vi.fn();
    const childTestId = "child-modal";

    const { getByTestId } = render(ModalPropagationTest, {
      props: { onParentClick, childTestId },
    });

    const button = getByTestId(childTestId);
    await fireEvent.click(button);

    expect(onParentClick).not.toHaveBeenCalled();
  });
});
