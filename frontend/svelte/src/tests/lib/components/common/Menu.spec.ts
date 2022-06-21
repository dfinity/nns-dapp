/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import Menu from "../../../../lib/components/common/MenuButton.svelte";

describe("Menu", () => {
  it("menu should be closed per default", () => {
    const { getByRole } = render(Menu);
    expect(() => getByRole("menu")).toThrow();
  });

  const openMenu = async ({ getByTestId, getByRole }) => {
    const button = getByTestId("menu") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(getByRole("menu")).not.toBeNull());
  };

  it("should open the menu", async () => {
    const renderResult = render(Menu);

    await openMenu(renderResult);
  });

  it("should not render a get icps feature", async () => {
    const renderResult = render(Menu);

    await openMenu(renderResult);

    const { getByTestId } = renderResult;

    expect(() => getByTestId("get-icp-button")).toThrow();
  });

  it("should render navigation", async () => {
    const renderResult = render(Menu);

    await openMenu(renderResult);

    const { getAllByRole } = renderResult;

    expect(getAllByRole("menuitem").length > 0).toBeTruthy();
  });
});
