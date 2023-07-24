import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
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

test("Test multi-tab auth", async ({ page: page1, context }) => {
  await page1.goto("/");
  await expect(page1).toHaveTitle("NNS Dapp");
  const appPo1 = new AppPo(PlaywrightPageObjectElement.fromPage(page1));

  const page2 = await context.newPage();
  await page2.goto("/");
  await expect(page2).toHaveTitle("NNS Dapp");
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

  // When signed in, the landing page redirects to the accounts page.
  await page1.goto("/");
  await expectSignedInAccountsPage(appPo1);

  await step("Sign out");
  await appPo1.getAccountMenuPo().openMenu();
  await appPo1.getAccountMenuPo().clickLogout();

  await expectSignedOut(appPo1);
  // The other page is also signed out automatically via a worker that checks
  // signed in status.
  await expectSignedOut(appPo2);
});
