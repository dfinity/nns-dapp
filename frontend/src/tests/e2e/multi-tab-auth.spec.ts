import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
    setFeatureFlag,
    signInWithNewUser,
    step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const expectSignedOut = async (appPo: AppPo) => {
  await appPo.getSignInPo().waitFor();
};

const expectSignedInAccountsPage = async (appPo: AppPo) => {
  // The sign in button might be absent just because the app is still loading.
  // So we wait for the accounts page to be present before checkign for the sign
  // in button.
  await appPo.getAccountsPo().waitFor();
  expect(await appPo.getSignInPo().isPresent()).toBe(false);
};

const expectSignedInPortfolioPage = async (appPo: AppPo) => {
  await appPo.getPortfolioPo().getPortfolioPagePo().waitFor();

  expect(
    await appPo.getPortfolioPo().getPortfolioPagePo().getLoginCard().isPresent()
  ).toBe(false);
};

test("Test multi-tab auth", async ({ page: page1, context }) => {
  await page1.goto("/accounts");
  await expect(page1).toHaveTitle("ICP Tokens / NNS Dapp");
  const appPo1 = new AppPo(PlaywrightPageObjectElement.fromPage(page1));

  const page2 = await context.newPage();
  await page2.goto("/accounts");
  await expect(page2).toHaveTitle("ICP Tokens / NNS Dapp");
  const appPo2 = new AppPo(PlaywrightPageObjectElement.fromPage(page2));

  // Neither page is signed in.
  await expectSignedOut(appPo1);
  await expectSignedOut(appPo2);

  await step("Sign in");
  await signInWithNewUser({ page: page1, context });

  // Page 1 is signed in but page 2 is not.
  await expectSignedInAccountsPage(appPo1);
  await expectSignedOut(appPo2);

  // Page 2 is also signed in after a reload.
  await page2.reload();
  await expectSignedInAccountsPage(appPo2);

  // When signed in, the landing page shows the portfolio page.
  await page1.goto("/");

  //TODO: Remove once the the feature flag is in PROD
  await expect(page1).toHaveTitle(/.*\s\/\sNNS Dapp/);

  await setFeatureFlag({
    page: page1,
    featureFlag: "ENABLE_PORTFOLIO_PAGE",
    value: true,
  });

  await page1.reload();
  await expectSignedInPortfolioPage(appPo1);

  await step("Sign out");
  await appPo1.getAccountMenuPo().openMenu();
  await appPo1.getAccountMenuPo().clickLogout();

  await expectSignedOut(appPo1);
  // The other page is also signed out automatically via a worker that checks
  // signed in status.
  await expectSignedOut(appPo2);
});
