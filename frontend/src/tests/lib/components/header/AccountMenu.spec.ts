import AccountMenu from "$lib/components/header/AccountMenu.svelte";
import {
  mockLinkClickEvent,
  resetNavigationCallbacks,
} from "$mocks/$app/navigation";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { AccountMenuPo } from "$tests/page-objects/AccountMenu.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { advanceTime } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("AccountMenu", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  const renderComponent = () => {
    const { container } = render(AccountMenu);

    const accountMenuPo = AccountMenuPo.under(
      new JestPageObjectElement(container)
    );
    const canistersLinkPo = accountMenuPo.getCanistersLinkPo();
    const linkToSettingsPo = accountMenuPo.getLinkToSettingsPo();
    const linkToReportingPo = accountMenuPo.getLinkToReportingPo();

    return {
      accountMenuPo,
      canistersLinkPo,
      linkToSettingsPo,
      linkToReportingPo,
    };
  };

  const preventLinkNavigation = async (accountMenuPo: AccountMenuPo) => {
    const canistersLinkPo = accountMenuPo.getCanistersLinkPo();
    const linkToSettingsPo = accountMenuPo.getLinkToSettingsPo();
    const linkToReportingPo = accountMenuPo.getLinkToReportingPo();

    await canistersLinkPo.root.addEventListener("click", mockLinkClickEvent);
    await linkToSettingsPo.root.addEventListener("click", mockLinkClickEvent);
    await linkToReportingPo.root.addEventListener("click", mockLinkClickEvent);
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

      await preventLinkNavigation(accountMenuPo);
      await linkToSettingsPo.click();

      // Wait for the popover closing transition to finish.
      await advanceTime(250);

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

      await preventLinkNavigation(accountMenuPo);
      await canistersLinkPo.click();

      // Wait for the popover closing transition to finish.
      await advanceTime(250);

      expect(await accountMenuPo.isOpen()).toBe(false);
    });

    describe("export feature flag", () => {
      beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
      });

      it("should display Reporting button link", async () => {
        const { accountMenuPo } = renderComponent();
        await accountMenuPo.openMenu();

        expect(await accountMenuPo.getLinkToReportingPo().isPresent()).toBe(
          true
        );
      });

      it("should close popover on click on reporting", async () => {
        const { accountMenuPo, linkToReportingPo } = renderComponent();
        await accountMenuPo.openMenu();

        await preventLinkNavigation(accountMenuPo);
        await linkToReportingPo.click();

        // Wait for the popover closing transition to finish.
        await advanceTime(250);

        expect(await accountMenuPo.isOpen()).toBe(false);
      });
    });
  });
});
