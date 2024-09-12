import AccountMenu from "$lib/components/header/AccountMenu.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { AccountMenuPo } from "$tests/page-objects/AccountMenu.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
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
    setNoIdentity();
    const { getByTestId } = render(AccountMenu);

    expect(getByTestId("toolbar-login")).not.toBeNull();
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

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

    it('should display "Manage ii" button if signed in', async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("manage-ii-link")).not.toBeNull();
    });

    it('should display "Source code" button if signed in', async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("source-code-link")).not.toBeNull();
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

    it("should render account details component", async () => {
      const renderResult = render(AccountMenu);

      const accountMenuPo = AccountMenuPo.under(
        new JestPageObjectElement(renderResult.container)
      );

      await accountMenuPo.openMenu();

      expect(await accountMenuPo.getAccountDetailsPo().isPresent()).toBe(true);
    });
  });
});
