/**
 * @jest-environment jsdom
 */

import AccountMenu from "$lib/components/header/AccountMenu.svelte";
import { authStore } from "$lib/stores/auth.store";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";

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

  it("should not display logout button if not signed in", async () => {
    const renderResult = render(AccountMenu);

    await show(renderResult);

    expect(() => renderResult.getByTestId("logout")).toThrow();
  });

  it("should display theme toggle", async () => {
    const renderResult = render(AccountMenu);

    await show(renderResult);

    expect(renderResult.getByTestId("theme-toggle")).not.toBeNull();
  });

  describe("signed in", () => {
    beforeAll(() =>
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe)
    );

    it("should display logout button if signed in", async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("logout")).not.toBeNull();
    });
  });
});
