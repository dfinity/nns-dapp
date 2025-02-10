import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

const screenshotsWithDifferentViewports = async ({
  page,
  step,
}: {
  page: Page;
  step: string;
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page).toHaveScreenshot(`${step}_desktop.png`, {
    mask: [
      page.locator('[data-tid="actionable-proposal-count-badge-component"]'),
    ],
  });

  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot(`${step}_mobile.png`);
};

test("Visual test Landing Page", async ({ page, browser }) => {
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const portfolioPo = appPo.getPortfolioPo();

  await page.goto("/");
  await portfolioPo.getPortfolioPagePo().getLoginCard().waitFor();
  await expect(page).toHaveTitle("Portfolio / NNS Dapp");
  await screenshotsWithDifferentViewports({ page, step: "initial" });

  step("New user is signed in");
  await signInWithNewUser({ page, context: browser.contexts()[0] });
  await portfolioPo.getPortfolioPagePo().getNoHeldTokensCard().waitFor();
  await portfolioPo.getPortfolioPagePo().getNoStakedTokensCarPo().waitFor();
  await screenshotsWithDifferentViewports({ page, step: "signed_in" });

  step("Get some ICP");
  await page.goto("/tokens");
  await appPo.getIcpTokens(41);

  step("Stake neuron (for voting)");
  await appPo.goToStaking();
  const stake = 15;
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: stake, dissolveDelayDays: "max" });
  await appPo.getNeuronsPo().waitFor();

  step("Total Assets");
  await page.goto("/");

  await portfolioPo.getPortfolioPagePo().getHeldTokensCardPo().waitFor();
  await portfolioPo.getPortfolioPagePo().getStakedTokensCardPo().waitFor();
  await screenshotsWithDifferentViewports({ page, step: "final_assets" });
});
