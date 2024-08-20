import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  replaceContent,
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

// We replace the actualy neuron IDs with these ones to make the screenshots
// consistent. We use different ones for each neuron to make sure the copy
// icons are correctly aligned with neuron IDs of differing width.
const replacementNeuronIds = [
  "2151613...5151617",
  "03a3234...db988b5",
  "02b87f0...ed11c4c",
  "5afd2dc...43c101d",
];

const createHotkeyNeuronsInOtherAccount = async ({
  hotkeyPrincipal,
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");
  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PROJECTS_TABLE",
    value: true,
  });
  await signInWithNewUser({ page, context });

  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));
  await appPo.getIcpTokens(21);

  await appPo.goToNnsNeurons();
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 10, dissolveDelayDays: "max" });
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 10, dissolveDelayDays: 0 });

  const neuronIds = await appPo.getNeuronsPo().getNnsNeuronsPo().getNeuronIds();
  expect(neuronIds).toHaveLength(2);

  await appPo.goToNeuronDetails(neuronIds[0]);
  await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .addHotkey(hotkeyPrincipal);
  await appPo.goBack();
  await appPo.goToNeuronDetails(neuronIds[1]);
  await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .addHotkey(hotkeyPrincipal);
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().joinCommunityFund();
  await page.close();
};

test("Test neurons table", async ({ page, context, browser }) => {
  await page.goto("/canisters");
  await expect(page).toHaveTitle("Canisters / NNS Dapp");
  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PROJECTS_TABLE",
    value: true,
  });

  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));

  await step("Sign in");
  await signInWithNewUser({ page, context });

  const principal = await appPo.getCanistersPo().getPrincipal();

  const createHotkeyNeuronsPromise = createHotkeyNeuronsInOtherAccount({
    hotkeyPrincipal: principal,
    browser,
  });

  step("Get some tokens");
  await appPo.getIcpTokens(41);

  step("Stake a neuron");
  await appPo.goToNnsNeurons();
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 20, dissolveDelayDays: 365 });

  const neuronIds = await appPo.getNeuronsPo().getNnsNeuronsPo().getNeuronIds();
  expect(neuronIds).toHaveLength(1);

  step("Start dissolving");
  await appPo.goToNeuronDetails(neuronIds[0]);
  const neuronDetail = appPo.getNeuronDetailPo().getNnsNeuronDetailPo();

  await neuronDetail.startDissolving();

  step("Get maturity");
  await neuronDetail.addMaturity(5);
  // Reload the page to see the maturity and enable the spawn neuron button.
  await page.reload();

  step("Spawn a neuron");
  await neuronDetail.spawnNeuron({ percentage: 100 });

  step("Wait for the hotkey neurons to be created");
  await createHotkeyNeuronsPromise;

  await page.reload();

  step("Make screenshots");
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();

  await replaceContent({
    page,
    selectors: ['[data-tid="neuron-id"]'],
    pattern: /[0-9a-f]{7}...[0-9a-f]{7}/,
    replacements: replacementNeuronIds,
  });

  await expect(page).toHaveScreenshot("desktop.png");
  await page.setViewportSize({ width: 480, height: 960 });
  await expect(page).toHaveScreenshot("mobile.png");
});
