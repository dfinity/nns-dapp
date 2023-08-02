import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

test.describe("Design", () => {
  const waitForSignIn = async (page: Page) => {
    const pageElement = PlaywrightPageObjectElement.fromPage(page);
    const appPo = new AppPo(pageElement);

    await appPo.getSignInPo().waitFor();
  };

  test("Login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("NNS Dapp");

    await waitForSignIn(page);

    await expect(page).toHaveScreenshot();
  });

  test("My Tokens", async ({ page, context }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("NNS Dapp");

    await waitForSignIn(page);

    await signInWithNewUser({ page, context });

    const pageElement = PlaywrightPageObjectElement.fromPage(page);
    const appPo = new AppPo(pageElement);

    await appPo.getAccountsPo().waitFor();
    await appPo.getAccountsPo().getNnsAccountsPo().waitForContentLoaded();

    await expect(page).toHaveScreenshot({
      mask: [page.locator('[data-tid="identifier"]')],
    });
  });
});
