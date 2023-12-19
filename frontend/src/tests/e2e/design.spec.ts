import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { replaceContent, signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

test.describe("Design", () => {
  test("Login", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page).toHaveTitle("My Tokens / NNS Dapp");
    // Wait for the button to make sure the screenshot is taken after the page is loaded
    await page.locator("[data-tid=login-button]").waitFor();

    await expect(page).toHaveScreenshot();
  });

  test("App loading spinner is removed", async ({ page }) => {
    await page.goto("/");

    // Wait for the button to make sure the app is loaded
    await page.locator("[data-tid=login-button]").waitFor();

    expect(await page.locator("#app-spinner").count()).toEqual(0);
  });

  test.describe("Signed-in", () => {
    // Reuse single page between tests
    // Source: https://playwright.dev/docs/test-retries#reuse-single-page-between-tests
    test.describe.configure({ mode: "serial" });

    let page: Page;

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();

      await page.goto("/accounts");
      await expect(page).toHaveTitle("My Tokens / NNS Dapp");

      await signInWithNewUser({ page, context: browser.contexts()[0] });
    });

    test.afterAll(async () => {
      await page.close();
    });

    const testMyTokens = async () => {
      const pageElement = PlaywrightPageObjectElement.fromPage(page);
      const appPo = new AppPo(pageElement);

      await appPo.getAccountsPo().waitFor();
      await appPo.getAccountsPo().getNnsAccountsPo().waitForContentLoaded();

      await replaceContent({
        page,
        selectors: [
          '[data-tid="identifier"]',
          '[data-tid="select-universe-card"]:not(:first-of-type) .name',
          '[data-tid="select-universe-card"]:not(:first-of-type) .amount .label',
        ],
        innerHtml: "XXXXX",
      });
      await expect(page).toHaveScreenshot();
    };

    test("My Tokens", async () => {
      await testMyTokens();
    });

    test("My Tokens (wide screen)", async () => {
      await page.setViewportSize({ width: 1300, height: 720 });

      await testMyTokens();
    });
  });
});
