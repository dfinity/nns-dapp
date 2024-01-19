import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  expectImagesLoaded,
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test.describe.configure({ retries: 2 });

test("Test images load on home page", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
  // TODO: GIX-1985 Remove this once the feature flag is enabled by default
  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_MY_TOKENS",
    value: true,
  });

  // Logos in tokens table
  const expectedImages = [
    "ckBTC.svg",
    "ckETH.svg",
    "icp-rounded.svg",
    // SNSes' logos from aggregator
    "logo.png",
    "logo.png",
    "logo.png",
    "logo.png",
    "logo.png",
    "logo.png",
    "logo.png",
    "logo.png",
    "logo.png",
    "logo.png",
  ];

  await step("Check images before signing");
  // Wait for table to load.
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  await appPo
    .getTokensPo()
    .getSignInTokensPagePo()
    .getTokensTablePo()
    .waitFor();
  await appPo
    .getTokensPo()
    .getSignInTokensPagePo()
    .getTokensTablePo()
    .waitForSnsRowsCards();

  await expectImagesLoaded({
    page,
    sources: expectedImages,
  });

  await signInWithNewUser({ page, context });

  await step("Check images after signing");

  await appPo.getTokensPo().getTokensPagePo().getTokensTable().waitFor();
  await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable()
    .waitForSnsRowsCards();

  await expectImagesLoaded({
    page,
    sources: expectedImages,
  });
});
