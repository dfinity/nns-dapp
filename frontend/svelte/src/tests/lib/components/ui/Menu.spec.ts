/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import Menu from "../../../../lib/components/ui/Menu.svelte";
import MenuTest from "./MenuTest.svelte";

describe("Menu-ui", () => {
  it("menu should be closed per default", () => {
    const { getByRole } = render(Menu);
    expect(() => getByRole("menu")).toThrow();
  });

  const openMenu = async ({ getByRole }) => {
    await waitFor(() => expect(getByRole("menu")).not.toBeNull());
  };

  it("should be open", async () => {
    const renderResult = render(Menu, {
      props: {
        open: true,
      },
    });

    await openMenu(renderResult);
  });

  it("should render a backdrop", () => {
    const { container } = render(Menu, {
      props: {
        open: true,
      },
    });

    const backdrop: HTMLDivElement | null =
      container.querySelector("div.backdrop");

    expect(backdrop).not.toBeNull();
  });

  it("should render slotted content", () => {
    const { getByTestId } = render(MenuTest);

    expect(getByTestId("menu-test-slot")).not.toBeNull();
  });
});
