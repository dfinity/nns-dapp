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
import { render, waitFor } from "@testing-library/svelte";

describe("AccountMenu", () => {
  const renderComponent = () => {
    const { container } = render(AccountMenu);

    const accountMenuPo = AccountMenuPo.under(
      new JestPageObjectElement(container)
    );
    const canistersLinkPo = accountMenuPo.getCanistersLinkPo();
    const linkToSettingsPo = accountMenuPo.getLinkToSettingsPo();
    const linkToReportingPo = accountMenuPo.getLinkToReportingPo();

    canistersLinkPo.root.addEventListener("click", mockLinkClickEvent);
    linkToSettingsPo.root.addEventListener("click", mockLinkClickEvent);
    linkToReportingPo.root.addEventListener("click", mockLinkClickEvent);

    return {
      accountMenuPo,
      canistersLinkPo,
      linkToSettingsPo,
      linkToReportingPo,
    };
  };

  it("should be closed by default", async () => {
    const { accountMenuPo } = renderComponent();
    expect(await accountMenuPo.isOpen()).toBe(false);
  });

  it("should display a sign-in button if not signed in", async () => {
    setNoIdentity();
    const { accountMenuPo } = renderComponent();

    expect(await accountMenuPo.getSignInButtonPo().isPresent()).toBe(true);
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetNavigationCallbacks();
      resetIdentity();
    });

    it("should be open", async () => {
      const { accountMenuPo } = renderComponent();
      await accountMenuPo.openMenu();
      expect(await accountMenuPo.isOpen()).toBe(true);
    });

    it("should display logout button", async () => {
      const { accountMenuPo } = renderComponent();
      await accountMenuPo.openMenu();

      expect(await accountMenuPo.getSignOutButtonPo().isPresent()).toBe(true);
    });

    it("should display settings button", async () => {
      const { accountMenuPo } = renderComponent();
      await accountMenuPo.openMenu();

      expect(await accountMenuPo.getLinkToSettingsPo().isPresent()).toBe(true);
    });

    it('should display "Manage ii" button', async () => {
      const { accountMenuPo } = renderComponent();
      await accountMenuPo.openMenu();

      expect(await accountMenuPo.getManangeIILinkPo().isPresent()).toBe(true);
    });

    it('should display "Canisters" button', async () => {
      const { accountMenuPo } = renderComponent();

      await accountMenuPo.openMenu();

      expect(await accountMenuPo.getCanistersLinkPo().isPresent()).toBe(true);
    });

    it("should close popover on click on settings", async () => {
      const { accountMenuPo, linkToSettingsPo } = renderComponent();
      await accountMenuPo.openMenu();

      await linkToSettingsPo.click();

      //wait for goto to be triggered
      await runResolvedPromises();

      expect(await accountMenuPo.isOpen()).toBe(false);
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

      expect(await accountMenuPo.isOpen()).toBe(false);
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

        await waitFor(async () => {
          expect(await accountMenuPo.isOpen()).toBe(false);
        });
      });

      it("should not show the LinkToReporting button if feature flag is off(by default", async () => {
        const { accountMenuPo } = renderComponent();
        await accountMenuPo.openMenu();

        expect(await accountMenuPo.getLinkToReportingPo().isPresent()).toBe(
          false
        );
      });

      it("should display Reporting button link", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_EXPORT_NEURONS_REPORT", true);

        const { accountMenuPo } = renderComponent();
        await accountMenuPo.openMenu();

        expect(await accountMenuPo.getLinkToReportingPo().isPresent()).toBe(
          true
        );
      });

      it("should close popover on click on reporting", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_EXPORT_NEURONS_REPORT", true);

        const { accountMenuPo, linkToReportingPo } = renderComponent();
        await accountMenuPo.openMenu();

        await linkToReportingPo.click();

        //wait for goto to be triggered
        await runResolvedPromises();

        expect(await accountMenuPo.isOpen()).toBe(false);
      });
    });
  });
});
