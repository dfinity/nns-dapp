/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import AccountMenu from "../../../../lib/components/header/AccountMenu.svelte";

describe("AccountMenu", () => {
  const show = async ({ container, getByRole }) => {
    await fireEvent.click(container.querySelector("button.toggle"));
    await waitFor(() => expect(getByRole("menu")).not.toBeNull());
  };

  it("should be closed by default", () => {
    const { getByRole } = render(AccountMenu);
    expect(() => getByRole("menu")).toThrow();
  });

  it("should be open", async () => {
    const renderResult = render(AccountMenu);

    await show(renderResult);
  });

  it("should display logout button", async () => {
    const renderResult = render(AccountMenu);

    await show(renderResult);

    expect(renderResult.getByTestId("logout")).not.toBeNull();
  });

  it("should display theme toggle", async () => {
    const renderResult = render(AccountMenu);

    await show(renderResult);

    expect(renderResult.getByTestId("theme-toggle")).not.toBeNull();
  });
});
