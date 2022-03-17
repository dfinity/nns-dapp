/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Toast from "../../../../lib/components/ui/Toast.svelte";
import type { ToastMsg } from "../../../../lib/types/toast";

describe("Toast", () => {
  const props: { msg: ToastMsg } = {
    msg: { labelKey: "core.close", level: "info", detail: "more details" },
  };

  it("should render a text", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("Close");
  });

  it("should render a close button", async () => {
    const { getByRole } = render(Toast, {
      props,
    });

    const button = getByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual("Close");
  });

  it("should render details", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("more details");
  });

  it("should render title", async () => {
    const { container } = render(Toast, {
      props,
    });

    const elementWithTitle: HTMLParagraphElement | null =
      container.querySelector('[title="Close more details"]');
    expect(elementWithTitle).not.toBeNull();
  });
});
