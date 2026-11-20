import { toastsStore } from "$lib/gix/stores/toasts.store";
import ToastsTest from "$tests/lib/gix/components/ToastsTest.svelte";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";

describe("Toasts", () => {
  afterEach(() => {
    toastsStore.reset();
  });

  it("should not display any toast per default", () => {
    const { container } = render(ToastsTest);

    expect(container.querySelector("div.toast")).toBeNull();
  });

  const waitForDialog = async (container: HTMLElement) =>
    await waitFor(() =>
      expect(container.querySelector("div.toast")).not.toBeNull()
    );

  it("should display a toast", async () => {
    const { container } = render(ToastsTest);

    const id = toastsStore.show({ text: "Test", level: "success" });

    await waitForDialog(container);

    toastsStore.hide(id);
  });

  it("should display an informative toast", async () => {
    const { container } = render(ToastsTest);

    const id = toastsStore.show({ text: "Test", level: "success" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");

    expect(dialog?.classList.contains("error")).toBeFalsy();

    toastsStore.hide(id);
  });

  it("should display an error toast", async () => {
    const { container } = render(ToastsTest);

    const id = toastsStore.show({ text: "Test", level: "error" });

    await waitForDialog(container);

    const icon: HTMLDivElement | null =
      container.querySelector("div.toast .icon");

    expect(icon?.classList.contains("error")).toBeTruthy();

    toastsStore.hide(id);
  });

  it("should display multiple toasts", async () => {
    const { container } = render(ToastsTest);

    toastsStore.show({ text: "Test", level: "error" });
    toastsStore.show({ text: "Test", level: "error" });
    toastsStore.show({ text: "Test", level: "error" });

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast")).toHaveLength(3)
    );
  });

  it("should return a shown toast id", () => {
    const id = toastsStore.show({ text: "Test", level: "success" });

    expect(id).toBeDefined();
    expect(typeof id).toBe("symbol");
    expect(id.description).toBe("toast");
  });

  it("should display multiple toasts for the bottom position", async () => {
    const { container } = render(ToastsTest);

    toastsStore.show({ text: "Test", level: "error", position: "bottom" });
    toastsStore.show({ text: "Test", level: "error" });
    toastsStore.show({ text: "Test", level: "error", position: "top" });

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast")).toHaveLength(2)
    );
  });

  it("should display the maximum number of toasts", async () => {
    const { container } = render(ToastsTest, { props: { maxVisible: 2 } });

    toastsStore.show({ text: "Test", level: "error" });
    toastsStore.show({ text: "Test", level: "error" });
    toastsStore.show({ text: "Test", level: "error" });

    await waitFor(() =>
      expect(container.querySelectorAll("div.toast")).toHaveLength(2)
    );
  });

  it("should display up to maximum number of toasts until user has close all toasts", async () => {
    const props = { props: { maxVisible: 2 } };

    const toast1 = Symbol();
    const toast2 = Symbol();
    const toast3 = Symbol();

    toastsStore.show({ text: "Test1", level: "error", id: toast1 });
    toastsStore.show({ text: "Test2", level: "error", id: toast2 });
    toastsStore.show({ text: "Test3", level: "error", id: toast3 });

    const { container: container1 } = render(ToastsTest, props);

    await waitFor(() =>
      expect(container1.querySelectorAll("div.toast")).toHaveLength(2)
    );

    toastsStore.hide(toast3);

    const { container: container2 } = render(ToastsTest, props);

    await waitFor(() =>
      expect(container2.querySelectorAll("div.toast")).toHaveLength(2)
    );

    toastsStore.hide(toast2);

    const { container: container3 } = render(ToastsTest, props);

    await waitFor(() =>
      expect(container3.querySelectorAll("div.toast")).toHaveLength(1)
    );

    toastsStore.hide(toast1);

    const { container: container4 } = render(ToastsTest, props);

    await waitFor(() =>
      expect(container4.querySelectorAll("div.toast")).toHaveLength(0)
    );
  });

  describe("auto hide", () => {
    beforeEach(() =>
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    );

    afterEach(() => vi.useRealTimers());

    it("should hide a toast after its duration", async () => {
      render(ToastsTest);

      toastsStore.show({ text: "Test", level: "success", duration: 1000 });

      await tick();

      vi.advanceTimersByTime(999);

      expect(get(toastsStore)).toHaveLength(1);

      vi.advanceTimersByTime(1);

      expect(get(toastsStore)).toHaveLength(0);
    });

    it("should hide a toast after its duration is updated", async () => {
      render(ToastsTest);

      const id = toastsStore.show({ text: "Test", level: "success" });

      await tick();

      toastsStore.update({ id, content: { duration: 1000 } });

      await tick();

      vi.advanceTimersByTime(999);

      expect(get(toastsStore)).toHaveLength(1);

      vi.advanceTimersByTime(1);

      expect(get(toastsStore)).toHaveLength(0);
    });

    it("should not hide a toast after its duration is removed", async () => {
      render(ToastsTest);

      const id = toastsStore.show({
        text: "Test",
        level: "success",
        duration: 1000,
      });

      await tick();

      toastsStore.update({ id, content: { duration: undefined } });

      await tick();

      vi.advanceTimersByTime(1000);

      expect(get(toastsStore)).toHaveLength(1);
    });
  });
});
