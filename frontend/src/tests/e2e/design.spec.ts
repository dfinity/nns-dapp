import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

test.describe("Design", () => {
  test("Login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("NNS Dapp");

    await expect(page).toHaveScreenshot();
  });

  test.describe("Signed-in", () => {
    // Reuse single page between tests
    // Source: https://playwright.dev/docs/test-retries#reuse-single-page-between-tests
    test.describe.configure({ mode: "serial" });

    let page: Page;

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();

      await page.goto("/");
      await expect(page).toHaveTitle("NNS Dapp");

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

      await expect(page).toHaveScreenshot({
        mask: [
          page.locator('[data-tid="identifier"]'),
          page.locator('[data-tid="select-universe-card"]:not(:first-of-type) .name'),
          page.locator('[data-tid="select-universe-card"]:not(:first-of-type) .amount .label'),
        ],
      });
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
