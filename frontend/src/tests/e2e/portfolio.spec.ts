import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test Portfolio page desktop", async ({ page, browser }) => {
  await page.setViewportSize({ width: 1300, height: 720 });
  await page.goto("/");

  await expect(page).toHaveTitle("Portfolio / NNS Dapp");
  await expect(page).toHaveScreenshot();

  await signInWithNewUser({ page, context: browser.contexts()[0] });
  await expect(page).toHaveScreenshot();

  step("Get some ICP");
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const portfolioPo = appPo.getPortfolioPo();

  await appPo.getIcpTokens(41);

  step("Stake neuron (for voting)");
  await appPo.goToStaking();
  const stake = 15;
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: stake, dissolveDelayDays: "max" });
  await appPo.getNeuronsPo().waitFor();

  step("Loading cards");
  await page.goto("/portfolio");
  await expect(page).toHaveScreenshot();

  step("Final assets");
  await portfolioPo.getPortfolioPagePo().getHeldTokensCardPo().waitFor();
  await portfolioPo.getPortfolioPagePo().getStakedTokensCardPo().waitFor();
  await expect(page).toHaveScreenshot();
});
