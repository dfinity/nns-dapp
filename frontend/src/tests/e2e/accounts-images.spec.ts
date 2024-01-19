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

test("Test images load on accounts page", async ({ page, context }) => {
  await page.goto("/accounts");
  await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
  // TODO: GIX-1985 Remove this once the feature flag is enabled by default
  await setFeatureFlag({ page, featureFlag: "ENABLE_MY_TOKENS", value: true });

  await step("Check images before signing");
  await expectImagesLoaded({
    page,
    sources: [
      // Internet Computer row in the table.
      "icp-rounded.svg",
    ],
  });

  await signInWithNewUser({ page, context });

  await step("Check images after signing");

  // Wait for table to load.
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  await appPo.getAccountsPo().getNnsAccountsPo().getTokensTablePo().waitFor();

  await expectImagesLoaded({
    page,
    sources: [
      // Internet Computer row in the table.
      "icp-rounded.svg",
      // Hidden title in main layout
      "icp-rounded.svg",
    ],
  });
});
