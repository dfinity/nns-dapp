/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import Popover from "../../../../lib/components/ui/Popover.svelte";
import PopoverTest from "./PopoverTest.svelte";

describe("Popover", () => {
  const showPopover = async ({ getByRole }) => {
    await waitFor(() => expect(getByRole("menu")).not.toBeNull());
  };

  it("should be closed by default", () => {
    const { getByRole } = render(Popover);
    expect(() => getByRole("menu")).toThrow();
  });

  it("should be visible", async () => {
    const renderResult = render(Popover, {
      props: {
        visible: true,
      },
    });

    await showPopover(renderResult);
  });

  it("should render a backdrop", () => {
    const { container } = render(Popover, {
      props: {
        visible: true,
      },
    });

    const backdrop: HTMLDivElement | null =
      container.querySelector("div.backdrop");

    expect(backdrop).not.toBeNull();
  });

  it("should render slotted content", () => {
    const { getByTestId } = render(PopoverTest);

    expect(getByTestId("Popover-slot")).not.toBeNull();
  });

  it("should render close button", async () => {
    const { container, queryByRole } = render(Popover, {
      props: {
        visible: true,
        closeButton: true,
      },
    });

    const close: HTMLButtonElement = container.querySelector(
      "button.close"
    ) as HTMLButtonElement;

    expect(close).not.toBeNull();

    await fireEvent.click(close);

    await waitFor(() => expect(queryByRole("menu")).toBeNull());
  });

  it("should render direction classes", async () => {
    const { container } = render(Popover, {
      props: {
        visible: true,
        direction: "rtl",
      },
    });

    const popover: HTMLDivElement | null = container.querySelector(".rtl");

    await expect(popover).not.toBeNull();
  });
});
