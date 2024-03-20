import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import TokensPage from "$lib/pages/Tokens.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createUserToken,
  userTokensPageMock,
} from "$tests/mocks/tokens-page.mock";
import { TokensPagePo } from "$tests/page-objects/TokensPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("Tokens page", () => {
  const token1 = createUserToken({
    universeId: OWN_CANISTER_ID,
  });
  const token2 = createUserToken({
    universeId: principal(0),
  });

  const renderPage = (userTokensData: UserTokenData[]) => {
    const { container } = render(TokensPage, {
      props: { userTokensData },
    });
    return TokensPagePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should render the tokens table", async () => {
    const po = renderPage(userTokensPageMock);
    expect(await po.hasTokensTable()).toBeDefined();
  });

  it("should render a row per token", async () => {
    const po = renderPage([token1, token2]);
    expect(await po.getTokensTable().getRows()).toHaveLength(2);
  });

  describe("with feature flag ENABLE_HIDE_ZERO_BALANCE enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_HIDE_ZERO_BALANCE", true);
    });

    it("should show settings button with feature flag enabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_HIDE_ZERO_BALANCE", true);

      const po = renderPage([token1, token2]);
      expect(await po.getSettingsButtonPo().isPresent()).toBe(true);
    });

    it("should open settings popup when clicking on settings button", async () => {
      const po = renderPage([token1, token2]);

      expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(false);
      expect(await po.getBackdropPo().isPresent()).toBe(false);
      await po.getSettingsButtonPo().click();
      expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(true);
      expect(await po.getBackdropPo().isPresent()).toBe(true);
    });

    it("should close settings popup when clicking on backdrop", async () => {
      const po = renderPage([token1, token2]);

      await po.getSettingsButtonPo().click();
      expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(true);
      expect(await po.getBackdropPo().isPresent()).toBe(true);

      await po.getBackdropPo().click();
      await runResolvedPromises();
      expect(await po.getHideZeroBalancesTogglePo().isPresent()).toBe(false);
      expect(await po.getBackdropPo().isPresent()).toBe(false);
    });
  });

  it("should not show settings button with feature flag disabled", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_HIDE_ZERO_BALANCE", false);

    const po = renderPage([token1, token2]);
    expect(await po.getSettingsButtonPo().isPresent()).toBe(false);
  });
});
