/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import Toasts from "../../../lib/components/Toasts.svelte";
import { toastsStore } from "../../../lib/stores/toasts.store";

describe("Toasts", () => {
  it("should not display any toast per default", () => {
    const { container } = render(Toasts);

    expect(container.querySelector("div.toast")).toBeNull();
  });

  const waitForDialog = async (container) =>
    await waitFor(() =>
      expect(container.querySelector("div.toast")).not.toBeNull()
    );

  it("should display a toast", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "info" });

    await waitForDialog(container);

    toastsStore.hide(0);
  });

  it("should display an informative toast", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "info" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(!dialog.classList.contains("error")).toBeTruthy();

    toastsStore.hide(0);
  });

  it("should display an error toast", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "error" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(dialog.classList.contains("error")).toBeTruthy();

    toastsStore.hide(0);
  });

  it("should stack multiple toasts", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(3)
    );

    toastsStore.hide(2);
    toastsStore.hide(1);
    toastsStore.hide(0);
  });

  it("should close toast", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "info" });

    await waitForDialog(container);

    const button: HTMLButtonElement | null = container.querySelector(
      'button[aria-label="Close"]'
    );
    fireEvent.click(button);

    await waitFor(() =>
      expect(container.querySelector("div.toast")).toBeNull()
    );
  });
});
