import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test merge neurons", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  // We need an account before we can get ICP.
  await appPo
    .getAccountsPo()
    .getNnsAccountsPo()
    .getMainAccountCardPo()
    .waitFor();
  await appPo.getTokens(10);

  step("Go to the neurons tab");
  await appPo.goToNeurons();

  step("Stake a neuron");
  const footerPo = appPo.getNeuronsPo().getNnsNeuronsFooterPo();
  const neuronsPo = appPo.getNeuronsPo().getNnsNeuronsPo();

  const stake1 = 1;
  const dissolveDelayDays1 = 3 * 365;
  await footerPo.stakeNeuron({
    amount: stake1,
    dissolveDelayDays: dissolveDelayDays1,
  });
  const neuronId1 = (await neuronsPo.getNeuronIds())[0];

  step("Stake a second neuron");
  const stake2 = 7;
  const dissolveDelayDays2 = 7 * 365;
  await footerPo.stakeNeuron({
    amount: stake2,
    dissolveDelayDays: dissolveDelayDays2,
  });
  const neuronId2 = (await neuronsPo.getNeuronIds())[0];

  expect(await (await neuronsPo.getNeuronCardPo(neuronId1)).getBalance()).toBe(
    stake1
  );
  expect(await (await neuronsPo.getNeuronCardPo(neuronId2)).getBalance()).toBe(
    stake2
  );

  step("Merge neurons");
  await footerPo.mergeNeurons({
    sourceNeurondId: neuronId1,
    targetNeuronId: neuronId2,
  });

  const transactionFee = 0.0001;
  expect(await (await neuronsPo.getNeuronCardPo(neuronId2)).getBalance()).toBe(
    stake1 + stake2 - transactionFee
  );

  expect(await neuronsPo.getNeuronIds()).not.toContain(neuronId1);
});
