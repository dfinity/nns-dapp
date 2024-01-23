import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { setFeatureFlag, signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

test.describe("Design", () => {
  test("Login", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
    // TODO: GIX-1985 Remove this once the feature flag is enabled by default
    await setFeatureFlag({
      page,
      featureFlag: "ENABLE_MY_TOKENS",
      value: true,
    });
    // Wait for balance in the first row of the table to make sure the screenshot is taken after the app is loaded.
    const pageElement = PlaywrightPageObjectElement.fromPage(page);
    const appPo = new AppPo(pageElement);
    await appPo.getSignInAccountsPo().getTokensTablePo().waitFor();
    const firstRow = await appPo
      .getSignInAccountsPo()
      .getTokensTablePo()
      .getRows();

    await firstRow[0].waitForBalance();

    // // We need to replace the content to not rely on the SNS project name.
    // await replaceContent({
    //   page,
    //   selectors: [rowNameSelector, rowTokenSymbolSelector],
    //   innerHtml: "XXXXX",
    // });

    // await page.waitForTimeout(50_000);

    await expect(page).toHaveScreenshot();
  });

  test("App loading spinner is removed", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
    // TODO: GIX-1985 Remove this once the feature flag is enabled by default
    await setFeatureFlag({
      page,
      featureFlag: "ENABLE_MY_TOKENS",
      value: true,
    });

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
      await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
      // TODO: GIX-1985 Remove this once the feature flag is enabled by default
      await setFeatureFlag({
        page,
        featureFlag: "ENABLE_MY_TOKENS",
        value: true,
      });

      await signInWithNewUser({ page, context: browser.contexts()[0] });
    });

    test.afterAll(async () => {
      await page.close();
    });

    const testMyTokens = async () => {
      const pageElement = PlaywrightPageObjectElement.fromPage(page);
      const appPo = new AppPo(pageElement);

      // Wait for balance in the first row of the table to make sure the screenshot is taken after the app is loaded.
      await appPo.getSignInAccountsPo().getTokensTablePo().waitFor();
      const firstRow = await appPo
        .getSignInAccountsPo()
        .getTokensTablePo()
        .getRows();

      await firstRow[0].waitForBalance();

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
