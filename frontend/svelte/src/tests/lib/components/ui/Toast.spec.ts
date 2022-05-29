/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Toast from "../../../../lib/components/ui/Toast.svelte";
import type { ToastMsg } from "../../../../lib/types/toast";
import en from "../../../mocks/i18n.mock";

describe("Toast", () => {
  const props: { msg: ToastMsg } = {
    msg: { labelKey: "core.close", level: "success", detail: "more details" },
  };

  it("should render a text", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("Close");
  });

  it("should render a close button", async () => {
    const { getByText } = render(Toast, {
      props,
    });

    const button = getByText(en.core.close);

    expect(button).toBeInTheDocument();
  });

  it("should render details", async () => {
    const { container } = render(Toast, {
      props,
    });

    const p: HTMLParagraphElement | null = container.querySelector("p");

    expect(p?.textContent).toContain("more details");
  });
});
