import Popover from "$lib/gix/components/Popover.svelte";
import PopoverTest from "$tests/lib/gix/components/PopoverTest.svelte";
import { render, waitFor } from "@testing-library/svelte";

describe("Popover", () => {
  it("should be closed by default", () => {
    const { getByRole } = render(Popover);

    expect(() => getByRole("menu")).toThrow();
  });

  it("should be visible", async () => {
    const { getByRole } = render(Popover, {
      props: {
        visible: true,
      },
    });

    await waitFor(() => expect(getByRole("menu")).not.toBeNull());
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
    expect(backdrop?.classList).toContain("visible");
  });

  it("should render a backdrop invisible", () => {
    const { container } = render(Popover, {
      props: {
        visible: true,
        invisibleBackdrop: true,
      },
    });

    const backdrop: HTMLDivElement | null =
      container.querySelector("div.backdrop");

    expect(backdrop).not.toBeNull();
    expect(backdrop?.classList).not.toContain("visible");
  });

  it("should render slotted content", () => {
    const { getByTestId } = render(PopoverTest);

    expect(getByTestId("Popover-slot")).not.toBeNull();
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

  it("should render content container", async () => {
    const { container } = render(Popover, {
      props: {
        visible: true,
      },
    });

    const popoverContent: HTMLDivElement | null =
      container.querySelector(".popover-content");

    await expect(popoverContent).not.toBeNull();
  });
});
