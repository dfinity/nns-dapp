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

const replacementNeuronIds = [
  "2151613...5151617",
  "03a3234...db988b5",
  "02b87f0...ed11c4c",
  "5afd2dc...43c101d",
];

const createHotkeyNeuronsInOtherAccount = async ({ principal, browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  await signInWithNewUser({ page, context });

  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));
  await appPo.getIcpTokens(21);

  await appPo.goToNeurons();
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 10, dissolveDelayDays: "max" });
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 10, dissolveDelayDays: 0 });

  const neuronIds = await getNnsNeuronCardsIds(appPo);
  expect(neuronIds).toHaveLength(2);

  await appPo.goToNeuronDetails(neuronIds[0]);
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().addHotkey(principal);
  await appPo.goBack();
  await appPo.goToNeuronDetails(neuronIds[1]);
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().addHotkey(principal);
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().joinCommunityFund();
  await page.close();
};

test("Test neurons table", async ({ page, context, browser }) => {
  await page.goto("/canisters");
  await expect(page).toHaveTitle("Canisters / NNS Dapp");
  let appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));

  await step("Sign in");
  await signInWithNewUser({ page, context });

  const principal = await appPo.getCanistersPo().getPrincipal();

  const createHotkeyNeuronsPromise = createHotkeyNeuronsInOtherAccount({
    principal,
    browser,
  });

  step("Get some tokens");
  await appPo.getIcpTokens(41);

  step("Stake a neuron");
  await appPo.goToNeurons();
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 20, dissolveDelayDays: 365 });

  const neuronIds = await getNnsNeuronCardsIds(appPo);
  expect(neuronIds).toHaveLength(1);

  step("Start dissolving");
  await appPo.goToNeuronDetails(neuronIds[0]);
  let neuronDetail = appPo.getNeuronDetailPo().getNnsNeuronDetailPo();

  await neuronDetail.startDissolving();

  step("Get maturity");
  await neuronDetail.addMaturity(5);
  // Reload the page to see the maturity.
  await page.reload();

  appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));
  neuronDetail = appPo.getNeuronDetailPo().getNnsNeuronDetailPo();

  step("Spawn a neuron");
  await neuronDetail.spawnNeuron({ percentage: 100 });

  step("Wait for the hotkey neurons to be created");
  await createHotkeyNeuronsPromise;

  setFeatureFlag({ page, featureFlag: "ENABLE_NEURONS_TABLE", value: true });
  await page.reload();

  step("Make screenshots");
  appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();

  // replaceContent fails on FireFox without this delay.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await replaceContent({
    page,
    selectors: ['[data-tid="neuron-id"]'],
    pattern: /[0-9a-f]{7}...[0-9a-f]{7}/,
    replacements: replacementNeuronIds,
  });

  await expect(page).toHaveScreenshot("desktop.png");
  await page.setViewportSize({ width: 480, height: 800 });
  //await new Promise((resolve) => setTimeout(resolve, 1000));
  await expect(page).toHaveScreenshot("mobile.png");
});
