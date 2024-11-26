import AccountMenu from "$lib/components/header/AccountMenu.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import {
  mockLinkClickEvent,
  resetNavigationCallbacks,
} from "$mocks/$app/navigation";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { AccountMenuPo } from "$tests/page-objects/AccountMenu.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("AccountMenu", () => {
  const show = async ({ container, getByRole }) => {
    await fireEvent.click(container.querySelector("button.toggle"));
    await waitFor(() => expect(getByRole("menu")).not.toBeNull());
  };

  const renderComponent = () => {
    const { container } = render(AccountMenu);

    const accountMenuPo = AccountMenuPo.under(
      new JestPageObjectElement(container)
    );
    const canistersLinkPo = accountMenuPo.getCanistersLinkPo();

    canistersLinkPo.root.addEventListener("click", mockLinkClickEvent);

    return { accountMenuPo, canistersLinkPo };
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
      resetNavigationCallbacks();
      resetIdentity();
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

    it("should display settings button", async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("settings")).not.toBeNull();
    });

    it('should display "Manage ii" button', async () => {
      const renderResult = render(AccountMenu);

      await show(renderResult);

      expect(renderResult.getByTestId("manage-ii-link")).not.toBeNull();
    });

    it('should display "Canisters" button', async () => {
      const { accountMenuPo } = renderComponent();

      await accountMenuPo.openMenu();

      expect(await accountMenuPo.getCanistersLinkPo().isPresent()).toBe(true);
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

    it("should close the account menu when LinkToCanisters is clicked", async () => {
      const { accountMenuPo, canistersLinkPo } = renderComponent();

      await accountMenuPo.openMenu();

      expect(await accountMenuPo.getAccountDetailsPo().isPresent()).toBe(true);

      await canistersLinkPo.click();

      //wait for goto to be triggered
      await runResolvedPromises();

      expect(await accountMenuPo.getAccountDetailsPo().isPresent()).toBe(false);
    });

    describe("export feature flag", () => {
      beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
      });

      it("should not show the Export Neurons Report button if feature flag is off(by default)", async () => {
        const { accountMenuPo } = renderComponent();

        await accountMenuPo.openMenu();

        expect(await accountMenuPo.getExportNeuronsButtonPo().isPresent()).toBe(
          false
        );
      });

      it("should show the Export Neurons Report button if feature flag is on", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_EXPORT_NEURONS_REPORT", true);
        const { accountMenuPo } = renderComponent();

        await accountMenuPo.openMenu();

        expect(await accountMenuPo.getExportNeuronsButtonPo().isPresent()).toBe(
          true
        );
      });

      it("should close the menu once the Export Neurons Report button is clicked", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_EXPORT_NEURONS_REPORT", true);
        const { accountMenuPo } = renderComponent();

        await accountMenuPo.openMenu();

        expect(await accountMenuPo.getAccountDetailsPo().isPresent()).toBe(
          true
        );

        await accountMenuPo.getExportNeuronsButtonPo().click();

        await vi.waitFor(async () => {
          expect(await accountMenuPo.getAccountDetailsPo().isPresent()).toBe(
            false
          );
        });
      });
    });
  });
});
