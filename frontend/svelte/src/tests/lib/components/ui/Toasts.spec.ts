/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import Toasts from "../../../../lib/components/ui/Toasts.svelte";
import { toastsStore } from "../../../../lib/stores/toasts.store";

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

    toastsStore.show({ labelKey: "test.test", level: "success" });

    await waitForDialog(container);

    toastsStore.hide();
  });

  it("should display an informative toast", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "success" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(dialog?.classList.contains("error")).toBeFalsy();
    toastsStore.hide();
  });

  it("should display an error toast", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "error" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(dialog?.classList.contains("error")).toBeTruthy();
    toastsStore.hide();
  });

  it("should display multiple toasts once at a time", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(1)
    );

    toastsStore.hide();

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(1)
    );

    toastsStore.hide();

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(1)
    );

    toastsStore.hide();

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(0)
    );
  });

  it("should close toast", async () => {
    const { container } = render(Toasts);

    toastsStore.show({ labelKey: "test.test", level: "success" });

    await waitForDialog(container);

    const button: HTMLButtonElement | null =
      container.querySelector("button.close");
    button && (await fireEvent.click(button));

    await waitFor(() =>
      expect(container.querySelector("div.toast")).toBeNull()
    );
  });
});
