import Toast from "$lib/gix/components/Toast.svelte";
import type { ToastMsg } from "$lib/gix/types/toast";
import { render } from "@testing-library/svelte";

describe("Toast", () => {
  const props: { msg: ToastMsg } = {
    msg: { id: Symbol("test"), text: "Test", level: "success" },
  };

  it("should render a text", () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("Test");
  });

  it("should render a close button", () => {
    const { container } = render(Toast, {
      props,
    });

    const button = container.querySelector("button.close");

    expect(button).toBeInTheDocument();
  });

  it("should render a title", () => {
    const title = "A super title";

    const { container } = render(Toast, {
      props: {
        msg: {
          ...props.msg,
          title,
        },
      },
    });

    const span: HTMLSpanElement | null = container.querySelector(".title");

    expect(span?.textContent).toContain(title);
  });

  it("should render a text as html", () => {
    const linkText = "here";
    const { container } = render(Toast, {
      props: {
        msg: {
          ...props.msg,
          text: `<a href='#' id='test-anchor'>${linkText}</a>`,
          renderAsHtml: true,
        },
      },
    });

    const link: HTMLAnchorElement | null =
      container.querySelector("#test-anchor");

    expect(link).toBeInTheDocument();
    expect(link?.textContent).toBe(linkText);
  });

  it("should not render a text as html", () => {
    const linkText = "here";
    const text = `<a href='#' id='test-anchor'>${linkText}</a>`;
    const { container } = render(Toast, {
      props: {
        msg: {
          ...props.msg,
          text,
        },
      },
    });

    const link: HTMLAnchorElement | null =
      container.querySelector("#test-anchor");

    expect(link).not.toBeInTheDocument();

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain(text);
  });
});
