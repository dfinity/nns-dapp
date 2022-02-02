/**
 * @jest-environment jsdom
 */

import Toast from "../../../lib/components/Toast.svelte";
import { render } from "@testing-library/svelte";
import type { ToastMsg } from "../../../lib/stores/toasts.store";

describe("Toast", () => {
  const props: { msg: ToastMsg } = {
    msg: { labelKey: "core.close", level: "info", detail: "more details" },
  };

  it("should render a text", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p).not.toBeNull();
    expect(p.textContent).toContain("Close");
  });

  it("should render a close button", async () => {
    const { getByRole } = render(Toast, {
      props,
    });

    const button = getByRole("button");

    expect(button).not.toBeNull();
    expect(button.getAttribute("aria-label")).toEqual("Close");
  });

  it("should render details", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p).not.toBeNull();
    expect(p.textContent).toContain("more details");
  });
});
