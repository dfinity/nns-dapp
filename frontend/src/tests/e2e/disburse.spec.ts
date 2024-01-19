import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test disburse neuron", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
  // TODO: GIX-1985 Remove this once the feature flag is enabled by default
  await setFeatureFlag({ page, featureFlag: "ENABLE_MY_TOKENS", value: true });
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(10);

  step("Go to the neurons tab");
  await appPo.goToNeurons();

  step("Stake a neuron");
  const stake = 3;
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: stake, dissolveDelayDays: 0 });

  step("Check account balance before disburse");
  await appPo.goToTokens();
  const icpRowBeforeDisburse = appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable()
    .getRowByName("Internet Computer");
  await icpRowBeforeDisburse.waitForBalance();
  const mainAccountBalanceBeforeDisburse =
    await icpRowBeforeDisburse.getBalanceNumber();

  step("Open the neuron details");
  await appPo.goToNeurons();
  const neuronCards = await appPo
    .getNeuronsPo()
    .getNnsNeuronsPo()
    .getNeuronCardPos();
  expect(neuronCards.length).toBe(1);
  neuronCards[0].click();

  step("Disburse the neuron");
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().disburseNeuron();

  step("Check account balance after disburse");
  await appPo.goToTokens();
  const icpRowAfterDisburse = appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable()
    .getRowByName("Internet Computer");
  await icpRowAfterDisburse.waitForBalance();
  const mainAccountBalanceAfterDisburse =
    await icpRowAfterDisburse.getBalanceNumber();

  // Actually there is a difference equal to the transaction fee, but it's
  // rounded away in the UI.
  expect(mainAccountBalanceAfterDisburse).toBe(
    mainAccountBalanceBeforeDisburse + stake
  );
});
