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
  await expect(page).toHaveTitle(/.*\s\/\sNNS Dapp/);

  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PORTFOLIO_PAGE",
    value: true,
  });

  await page.reload();
  await expect(page).toHaveTitle("Portfolio / NNS Dapp");
  await signInWithNewUser({ page, context });

  await page.goto("/tokens");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(10);

  step("Go to the staking tab");
  await appPo.goToStaking();

  step("Stake a neuron");
  const stake = 3;
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: stake, dissolveDelayDays: 0 });

  step("Check account balance before disburse");
  await appPo.goToAccounts();
  const icpRowBeforeDisburse = await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable()
    .getRowByName("Internet Computer");
  await icpRowBeforeDisburse.waitForBalance();
  const mainAccountBalanceBeforeDisburse =
    await icpRowBeforeDisburse.getBalanceNumber();

  step("Open the neuron details");
  await appPo.goToNnsNeurons();
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();
  const neuronRows = await appPo
    .getNeuronsPo()
    .getNnsNeuronsPo()
    .getNeuronsTablePo()
    .getNeuronsTableRowPos();
  expect(neuronRows).toHaveLength(1);
  neuronRows[0].click();

  step("Unlock the neuron for testing");
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().unlockNeuron();

  step("Disburse the neuron");
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().disburseNeuron();
  // After disburing, the app navigatings to the neurons table.
  await appPo.getNeuronDetailPo().waitForAbsent();

  step("Check account balance after disburse");
  await appPo.goToAccounts();
  const icpRowAfterDisburse = await appPo
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
