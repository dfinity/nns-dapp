import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test SNS governance", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Network Nervous System frontend dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  await appPo.goToLaunchpad();

  // D001: User can see the list of open sales
  // TODO

  // D002: User can see the list of successful sales
  // TODO

  // D003: User can see the details of one sale
  // TODO

  // D004: User can participate in a sale
  // TODO

  // D005: User can increase the participation in a sale
  // TODO
});
