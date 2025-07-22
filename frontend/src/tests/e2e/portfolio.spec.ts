import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  replaceContent,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

const VIEWPORT_SIZES = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 667 },
} as const;

const mockTimeRemainingContent = async (page: Page) =>
  replaceContent({
    page,
    selectors: ['[data-tid="time-remaining"]'],
    pattern: /.*/,
    replacements: ["64 days, 10 hours"],
  });

test("Visual test Landing Page", async ({ page, browser }) => {
  await page.addInitScript(() => {
    // @ts-expect-error: Overrides setinterval for tests
    window.setInterval = (_: TimerHandler, timeout: number) => {
      const noop = () => {};
      const id = setTimeout(noop, timeout);
      return id;
    };
  });
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const portfolioPo = appPo.getPortfolioPo();

  await page.goto("/");
  await disableCssAnimations(page);
  await expect(page).toHaveTitle("Portfolio | Network Nervous System");

  await page.setViewportSize(VIEWPORT_SIZES.desktop);

  await portfolioPo.getPortfolioPagePo().getTotalAssetsCardPo().waitForLoaded();
  await appPo.getMenuItemsPo().getTotalValueLockedLinkPo().waitFor();

  // Add CSS to disable skeleton animations
  await page.addStyleTag({
    content: `
      [data-tid="apy-fallback-card"] .skeleton {
        animation: none !important;
        background: red !important;
      }
    `,
  });

  // The governance metrics are only updated once a day so for the first 24h
  // after a snapshot is created, the metrics might be different than what
  // we expectand we need to replace them with the expected value.
  if ((await appPo.getMenuItemsPo().getTvlMetric()) === "$99") {
    await replaceContent({
      page,
      selectors: ['[data-tid="tvl-metric"]'],
      pattern: /\$[0-9’]+/,
      replacements: ["$4’500’001’000"],
    });
  }
  await mockTimeRemainingContent(page);
  await expect(page).toHaveScreenshot(`initial_desktop.png`);

  await mockTimeRemainingContent(page);
  await page.setViewportSize(VIEWPORT_SIZES.mobile);
  await expect(page).toHaveScreenshot(`initial_mobile.png`);

  step("New user is signed in");
  await signInWithNewUser({ page, context: browser.contexts()[0] });

  await replaceContent({
    page,
    selectors: ['[data-tid="apy-fallback-card"]'],
    pattern: /.*/,
    replacements: ["<div>APY Fallback Card</div>"],
  });

  step("Get some ICP and BTC");
  await page.goto("/tokens");
  await disableCssAnimations(page);
  await appPo.getIcpTokens(41);
  const ckBTCRow = await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getCkTokensTable()
    .getRowByName("ckBTC");
  await ckBTCRow.waitForBalance();
  await appPo.getBtc(1);
  await ckBTCRow.click();
  await appPo.getWalletPo().getCkBTCWalletPo().clickRefreshBalance();
  await appPo.waitForNotBusy();

  step("Stake neuron (for voting)");
  // Scroll to top to make the header visible
  await appPo.scrollToTop();
  await appPo.goToStaking();
  const stake = 15;
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: stake, dissolveDelayDays: "max" });
  await appPo.getNeuronsPo().waitFor();

  step("Total Assets");
  await page.goto("/");
  await disableCssAnimations(page);

  await portfolioPo.getPortfolioPagePo().getHeldRestTokensCardPo().waitFor();
  await portfolioPo.getPortfolioPagePo().getStakedRestTokensCardPo().waitFor();

  await page.setViewportSize(VIEWPORT_SIZES.desktop);
  await appPo.toggleSidebar();
  await mockTimeRemainingContent(page);
  await expect(page).toHaveScreenshot(`final_assets_desktop.png`);

  await mockTimeRemainingContent(page);
  await page.setViewportSize(VIEWPORT_SIZES.mobile);
  await expect(page).toHaveScreenshot(`final_assets_mobile.png`);
});
