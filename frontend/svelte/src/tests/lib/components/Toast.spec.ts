/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import Toast from "../../../lib/components/Toast.svelte";
import { msg } from "../../../lib/stores/msg.store";

describe("Toast", () => {
  it("should be hidden per default", () => {
    const { container } = render(Toast);

    expect(container.querySelector("div.toast")).toBeNull();
  });

  const waitForDialog = async (container) =>
    await waitFor(() =>
      expect(container.querySelector("div.toast")).not.toBeNull()
    );

  it("should display toast", async () => {
    const { container } = render(Toast);

    msg.set({ labelKey: "test.test", level: "info" });

    await waitForDialog(container);
  });

  it("should display an informative msg", async () => {
    const { container } = render(Toast);

    msg.set({ labelKey: "test.test", level: "info" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(!dialog.classList.contains("error")).toBeTruthy();
  });

  it("should display an error msg", async () => {
    const { container } = render(Toast);

    msg.set({ labelKey: "test.test", level: "error" });

    await waitForDialog(container);

    const dialog: HTMLDivElement | null = container.querySelector("div.toast");
    expect(dialog.classList.contains("error")).toBeTruthy();
  });

  it("should render a text", async () => {
    const { container, getByText } = render(Toast);

    msg.set({ labelKey: "header.title", level: "info" });

    await waitForDialog(container);

    expect(getByText("NETWORK NERVOUS SYSTEM")).toBeInTheDocument();
  });

  it("should render a close button", async () => {
    const { container, getByRole } = render(Toast);

    msg.set({ labelKey: "test.test", level: "info" });

    await waitForDialog(container);

    const button = getByRole("button");

    expect(button).not.toBeNull();
    expect(button.getAttribute("aria-label")).toEqual("Close");
  });

  it("should close toast", async () => {
    const { container } = render(Toast);

    msg.set({ labelKey: "test.test", level: "info" });

    await waitForDialog(container);

    const button: HTMLButtonElement | null = container.querySelector("button");
    fireEvent.click(button);

    await waitFor(() =>
      expect(container.querySelector("div.toast")).toBeNull()
    );
  });
});
