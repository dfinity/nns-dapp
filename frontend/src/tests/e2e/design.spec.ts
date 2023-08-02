import {expect, test} from "@playwright/test";
import {PlaywrightPageObjectElement} from "$tests/page-objects/playwright.page-object";
import {AppPo} from "$tests/page-objects/App.page-object";

test.describe("Design", () => {
  test("Login", async ({ page }) => {
    await page.goto("/");

    const pageElement = PlaywrightPageObjectElement.fromPage(page);
    const appPo = new AppPo(pageElement);

    await appPo.getSignInPo().waitFor();

    await expect(page).toHaveScreenshot();
  });
});
