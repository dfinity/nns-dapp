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

// TODO: GIX-1985 Remove the test when the feature flag is removed
test("Test images load on accounts page", async ({ page, context }) => {
  await page.goto("/accounts");
  await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
  await setFeatureFlag({ page, featureFlag: "ENABLE_MY_TOKENS", value: false });

  await step("Check images before signing");
  await expectImagesLoaded({
    page,
    sources: ["icp-rounded.svg", "icp-rounded.svg"],
  });

  await signInWithNewUser({ page, context });

  await step("Check images after signing");

  // Open Snses list
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  await appPo.openUniverses();

  await expectImagesLoaded({
    page,
    sources: [
      // Universe selector in main layout
      "ckBTC.svg",
      // Universe selector in main layout
      "ckETH.svg",
      // Universe selector in main layout
      "icp-rounded.svg",
      // Hidden title in main layout
      "icp-rounded.svg",
      // ICP universe card in the universes selector modal
      "icp-rounded.svg",
      // logo.png are for all the different SNSes and are loaded from the
      // aggregator:
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
      "logo.png",
    ],
  });
});
