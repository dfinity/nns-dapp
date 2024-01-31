import MenuItems from "$lib/components/common/MenuItems.svelte";
import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { AppPath, UNIVERSE_PARAM } from "$lib/constants/routes.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/$public/worker-metrics.services", () => ({
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
  const shouldRenderMenuItem = ({
    context,
    labelKey,
  }: {
    context: string;
    labelKey: string;
  }) => {
    const { getByTestId } = render(MenuItems);
    const link = getByTestId(`menuitem-${context}`) as HTMLElement;
    expect(link).not.toBeNull();
    expect(link).toBeVisible();
    expect(link.textContent?.trim()).toEqual(en.navigation[labelKey]);
  };

  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should render accounts menu item", () =>
    shouldRenderMenuItem({ context: "accounts", labelKey: "tokens" }));
  it("should render neurons menu item", () =>
    shouldRenderMenuItem({ context: "neurons", labelKey: "neurons" }));
  it("should render voting menu item", () =>
    shouldRenderMenuItem({ context: "proposals", labelKey: "voting" }));
  it("should render canisters menu item", () =>
    shouldRenderMenuItem({ context: "canisters", labelKey: "canisters" }));

  it("should not render a get icps feature", async () => {
    const renderResult = render(MenuItems);

    const { getByTestId } = renderResult;

    expect(() => getByTestId("get-icp-button")).toThrow();
  });

  describe("when My Tokens page is disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
    });

    it("should point Tokens and Neurons to NNS from the project page", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      const { getByTestId } = render(MenuItems);

      const accountsLink = getByTestId("menuitem-accounts");
      expect(accountsLink.getAttribute("href")).toEqual(
        `${AppPath.Accounts}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID.toText()}`
      );

      const neuronsLink = getByTestId("menuitem-neurons");
      expect(neuronsLink.getAttribute("href")).toEqual(
        `${AppPath.Neurons}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID.toText()}`
      );
    });
  });

  describe("when My Tokens page is enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
    });

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
});
