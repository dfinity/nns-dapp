import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { getNnsNeuronCardsIds } from "$tests/utils/e2e.nns-neuron.test-utils";
import {
  replaceContent,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test neuron details", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");
  await signInWithNewUser({ page, context });

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
  await replaceContent({
    page,
    selectors: ['[data-tid="identifier"]'],
    pattern: /[0-9a-f]{19}/,
    replacements: ["7737260276268288098"],
  });

  const neuronDetailElement = await page.locator('[data-tid="neuron-detail"]');
  const boundingBox = await neuronDetailElement.boundingBox();

  // Set the viewport height based on the element's height
  // Adding some padding to ensure the entire element is visible
  await page.setViewportSize({
    width: 1023, // Use the original desktop width
    height: Math.ceil(boundingBox.height) + Math.ceil(boundingBox.y) * 2, // Add 20px padding
  });
  await expect(page).toHaveScreenshot("desktop.png");

  // Set mobile viewport
  await page.setViewportSize({ width: 480, height: 960 });
  // Get updated bounding box of the neuron detail element
  const boundingBoxMobile = await neuronDetailElement.boundingBox();
  // Set viewport to mobile size with updated height
  await page.setViewportSize({
    width: 480,
    height:
      Math.ceil(boundingBoxMobile.height) + Math.ceil(boundingBoxMobile.y) * 2,
  });

  await expect(page).toHaveScreenshot("mobile.png");
});
