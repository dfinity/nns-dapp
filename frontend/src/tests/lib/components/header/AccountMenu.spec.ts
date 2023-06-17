/**
 * @jest-environment jsdom
 */

import AccountMenu from "$lib/components/header/AccountMenu.svelte";
import { authStore } from "$lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("AccountMenu", () => {
  const show = async ({ container, getByRole }) => {
    await fireEvent.click(container.querySelector("button.toggle"));
    await waitFor(() => expect(getByRole("menu")).not.toBeNull());
  };

  it("should be closed by default", () => {
    const { getByRole } = render(AccountMenu);
    expect(() => getByRole("menu")).toThrow();
  });

  it("should display a sign-in button if not signed in", () => {
    const { getByTestId } = render(AccountMenu);

    expect(getByTestId("toolbar-login")).not.toBeNull();
  });

  describe("signed in", () => {
    beforeAll(() =>
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe)
    );

    it("should be open", async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);
    });

    it("should display theme toggle", async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("theme-toggle")).not.toBeNull();
    });

    it("should display logout button if signed in", async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("logout")).not.toBeNull();
    });

    it("should display settings button if signed in", async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("settings")).not.toBeNull();
    });

    it("should close popover on click on settings", async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      const settings = renderResult.getByTestId("settings");

      settings !== null && fireEvent.click(settings);

      await waitFor(() =>
        expect(() => renderResult.getByRole("menu")).toThrow()
      );
    });
  });
});
