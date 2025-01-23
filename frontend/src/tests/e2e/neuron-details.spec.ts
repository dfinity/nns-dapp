import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { getNnsNeuronCardsIds } from "$tests/utils/e2e.nns-neuron.test-utils";
import {
  replaceContent,
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test neuron details", async ({ page, context }) => {
  await page.goto("/");
  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PORTFOLIO_PAGE",
    value: true,
  });
  await expect(page).toHaveTitle("Portfolio / NNS Dapp");
  await signInWithNewUser({ page, context });

  await page.goto("/tokens");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");

  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_USD_VALUES_FOR_NEURONS",
    value: true,
  });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(41);

  step("Stake neuron");
  await appPo.goToStaking();
  const stake = 15;
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: stake, dissolveDelayDays: "max" });
  await appPo.getNeuronsPo().waitFor();

  const neuronIds = await getNnsNeuronCardsIds(appPo);
  expect(neuronIds).toHaveLength(1);
  const neuronId = neuronIds[0];

  step("Open neuron details");
  await appPo.goToNeuronDetails(neuronId);

  step("Make screenshots");

  // Replace neuron details with fixed values
  await replaceContent({
    page,
    selectors: ['[data-tid="identifier"]', '[data-tid="neuron-id"]'],
    pattern: /^[0-9a-f]+$/,
    replacements: ["7737260276268288098"],
  });
  await replaceContent({
    page,
    selectors: ['[data-tid="neuron-created"]'],
    pattern: /\b[A-Za-z]{3} \d{1,2}, \d{4} \d{1,2}:\d{2} [AP]M\b/,
    replacements: ["Sep 23, 2024 11:04 AM"],
  });
  await replaceContent({
    page,
    selectors: ['[data-tid="nns-neuron-age"]'],
    pattern: /(\d+)\s+(second|seconds)/,
    replacements: ["9 seconds"],
  });
  await replaceContent({
    page,
    selectors: ['[data-tid="neuron-account"]'],
    pattern: /[0-9a-f]{7}...[0-9a-f]{7}/,
    replacements: ["364747d...0946316"],
  });
  await replaceContent({
    page,
    selectors: ['[data-tid="last-rewards-distribution"]'],
    pattern: /\b[A-Za-z]{3} \d{1,2}, \d{4}\b/,
    replacements: ["Sep 26, 2024"],
  });

  // set viewport to capture the entire advanced section
  const advancedSectionElement = await page.locator(
    '[data-tid="nns-neuron-advanced-section-component"]'
  );
  const advancedSectionBoundingBox = await advancedSectionElement.boundingBox();

  await page.setViewportSize({
    width: 1023, // Use the original desktop width
    height:
      Math.ceil(
        advancedSectionBoundingBox.y + advancedSectionBoundingBox.height
      ) + 20, // Add 20px padding
  });
  await expect(page).toHaveScreenshot("desktop.png");

  // Set mobile viewport

  await page.setViewportSize({ width: 480, height: 960 });
  // Get updated bounding box of the advanced section
  const advancedSectionBoundingBoxMobile =
    await advancedSectionElement.boundingBox();
  // Set viewport to capture the entire advanced section
  await page.setViewportSize({
    width: 480, // Use the original mobile width
    height:
      Math.ceil(
        advancedSectionBoundingBoxMobile.y +
          advancedSectionBoundingBoxMobile.height
      ) + 20, // Add 20px padding
  });

  await expect(page).toHaveScreenshot("mobile.png");
});
