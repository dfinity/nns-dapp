import MenuItems from "$lib/components/common/MenuItems.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { MenuItemsPo } from "$tests/page-objects/MenuItems.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { ProposalInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/public/worker-metrics.services", () => ({
  initMetricsWorker: vi.fn(() =>
    Promise.resolve({
      startMetricsTimer: () => {
        // Do nothing
      },
      stopMetricsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("MenuItems", () => {
  const renderComponent = (): MenuItemsPo => {
    const { container } = render(MenuItems);
    return MenuItemsPo.under(new JestPageObjectElement(container));
  };
  const shouldRenderMenuItem = ({
    context,
    labelKey,
    href,
  }: {
    context: string;
    labelKey: string;
    href?: string;
  }) => {
    const { getByTestId } = render(MenuItems);
    const link = getByTestId(`menuitem-${context}`) as HTMLElement;
    expect(link).not.toBeNull();
    expect(link).toBeVisible();
    expect(link.textContent?.trim()).toEqual(en.navigation[labelKey]);
    if (href) {
      expect(link.getAttribute("href")).toEqual(href);
    }
  };

  it("should render accounts menu item", () =>
    shouldRenderMenuItem({ context: "accounts", labelKey: "tokens" }));

  it("should render neurons menu item without projects table", () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_PROJECTS_TABLE", false);
    shouldRenderMenuItem({
      context: "neurons",
      labelKey: "neurons",
      href: "/neurons/?u=qhbym-qaaaa-aaaaa-aaafq-cai",
    });
  });

  it("should render neurons menu item with projects table", () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_PROJECTS_TABLE", true);
    shouldRenderMenuItem({
      context: "neurons",
      labelKey: "neurons",
      href: "/staking",
    });
  });

  it("should render voting menu item", () =>
    shouldRenderMenuItem({ context: "proposals", labelKey: "voting" }));

  it("should not render a get icps feature", async () => {
    const renderResult = render(MenuItems);

    const { getByTestId } = renderResult;

    expect(() => getByTestId("get-icp-button")).toThrow();
  });

  describe("when My Tokens page is enabled", () => {
    it("should point Tokens to /tokens", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      const { getByTestId } = render(MenuItems);

      const accountsLink = getByTestId("menuitem-accounts");
      expect(accountsLink.getAttribute("href")).toEqual(AppPath.Tokens);
    });

    it("should have Tokens selected when in /tokens path", () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Tokens,
      });
      const { getByTestId } = render(MenuItems);

      const accountsLink = getByTestId("menuitem-accounts");
      expect(accountsLink.classList.contains("selected")).toBe(true);
    });
  });

  describe("actionable proposal link", () => {
    it("should have actionable proposal link", async () => {
      resetIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });

      shouldRenderMenuItem({
        context: "proposals",
        labelKey: "voting",
        href: "/proposals/?actionable",
      });
    });

    it("should have default proposal link when signedOut", async () => {
      setNoIdentity();
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Proposals,
      });

      shouldRenderMenuItem({
        context: "proposals",
        labelKey: "voting",
        href: "/proposals/?u=qhbym-qaaaa-aaaaa-aaafq-cai",
      });
    });
  });

  describe("actionable proposal count badge", () => {
    const nnsProposals: ProposalInfo[] = [
      {
        ...mockProposalInfo,
        id: 0n,
      },
      {
        ...mockProposalInfo,
        id: 1n,
      },
    ];
    const snsProposals = [mockSnsProposal];
    const snsRootCanisterId = principal(0);

    beforeEach(() => {
      resetIdentity();
      actionableNnsProposalsStore.reset();
      actionableSnsProposalsStore.resetForTesting();
    });

    it("should display actionable proposal count", async () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Neurons,
      });
      actionableNnsProposalsStore.setProposals(nnsProposals);
      actionableSnsProposalsStore.set({
        rootCanisterId: snsRootCanisterId,
        proposals: snsProposals,
      });

      const po = renderComponent();

      expect(await po.getProposalsActionableCountBadgePo().isPresent()).toBe(
        true
      );
      expect(
        (await po.getProposalsActionableCountBadgePo().getText()).trim()
      ).toEqual("3");
      expect(
        await po
          .getProposalsActionableCountBadgePo()
          .getTooltipPo()
          .getTooltipText()
      ).toEqual("You can still vote on 3 proposals.");
    });

    it("should not display actionable proposal count when no proposal available", async () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Neurons,
      });

      const po = renderComponent();

      expect(await po.getProposalsActionableCountBadgePo().isPresent()).toBe(
        false
      );
    });

    it("should display Source code button", async () => {
      const menuItemsPo = renderComponent();

      expect(await menuItemsPo.getSourceCodeButtonPo().isPresent()).toBe(true);
      expect(await menuItemsPo.getSourceCodeButtonLink()).toBe(
        "https://github.com/dfinity/nns-dapp"
      );
    });
  });
});
