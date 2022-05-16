/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { toastsStore } from "../../../../lib/stores/toasts.store";
import ToastsTest from "./ToastsTest.svelte";

describe("Toasts", () => {
  afterEach(() => {
    toastsStore.reset();
  });

  it("should not display any toast per default", () => {
    const { container } = render(ToastsTest);

    expect(container.querySelector("div.toast")).toBeNull();
  });

  const waitForDialog = async (container) =>
    await waitFor(() =>
      expect(container.querySelector("div.toast")).not.toBeNull()
    );

  it("should display a toast", async () => {
    const { container } = render(ToastsTest);

    toastsStore.show({ labelKey: "test.test", level: "success" });

    await waitForDialog(container);

    toastsStore.hide();
  });

  it("should display an informative toast", async () => {
    const { container } = render(ToastsTest);

    toastsStore.show({ labelKey: "test.test", level: "success" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(dialog?.classList.contains("error")).toBeFalsy();
    toastsStore.hide();
  });

  it("should display an error toast", async () => {
    const { container } = render(ToastsTest);

    toastsStore.show({ labelKey: "test.test", level: "error" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(dialog?.classList.contains("error")).toBeTruthy();
    toastsStore.hide();
  });

  it("should display multiple toasts", async () => {
    const { container } = render(ToastsTest);

    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(3)
    );
  });

  it("should display multiple toasts and user is able to close one", async () => {
    const { container } = render(ToastsTest);

    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });
    toastsStore.show({ labelKey: "test.test", level: "error" });

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(3)
    );

    const button: HTMLButtonElement | null =
      container.querySelector("button.close");
    button && (await fireEvent.click(button));

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast").length).toEqual(2)
    );
  });

  it("should close toast", async () => {
    const { container } = render(ToastsTest);

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
