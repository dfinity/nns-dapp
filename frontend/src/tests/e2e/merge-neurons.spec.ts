import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test merge neurons", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(20);

  step("Go to the neurons tab");
  await appPo.goToNeurons();

  step("Stake a neuron");
  const footerPo = appPo.getNeuronsPo().getNnsNeuronsFooterPo();
  const neuronsPo = appPo.getNeuronsPo().getNnsNeuronsPo();

  const initialStake1 = 1;
  const dissolveDelayDays1 = 3 * 365;
  await footerPo.stakeNeuron({
    amount: initialStake1,
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
    initialStake1
  );
  expect(await (await neuronsPo.getNeuronCardPo(neuronId2)).getBalance()).toBe(
    stake2
  );

  step("Increase stake on first neuron");
  const finalStake1 = 3;
  await appPo.goToNeuronDetails(neuronId1);
  await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .increaseStake({ amount: finalStake1 - initialStake1 });
  // Go back to make the menu button visible again.
  await appPo.goBack();

  step("Merge neurons");
  await appPo.goToNeurons();

  await footerPo.mergeNeurons({
    sourceNeurondId: neuronId1,
    targetNeuronId: neuronId2,
  });

  const transactionFee = 0.0001;
  expect(await (await neuronsPo.getNeuronCardPo(neuronId2)).getBalance()).toBe(
    finalStake1 + stake2 - transactionFee
  );

  expect(await neuronsPo.getNeuronIds()).not.toContain(neuronId1);

  step("Check transaction descriptions");
  // Make sure that we still recognize transactions for neurons that we no
  // longer display correctly as Stake/Top-up.
  // Reload the page in case we would only know the neuron because it was still
  // in the store from before.
  await page.goto("/");
  await appPo.goToNnsMainAccountWallet();
  const transactionList = appPo
    .getWalletPo()
    .getNnsWalletPo()
    .getUiTransactionsListPo();
  await transactionList.waitForLoaded();
  const transactions = await transactionList.getTransactionCardPos();
  expect(await Promise.all(transactions.map((tx) => tx.getHeadline()))).toEqual(
    ["Top-up Neuron", "Staked", "Staked", "Received"]
  );
  expect(await Promise.all(transactions.map((tx) => tx.getAmount()))).toEqual([
    "-2.0001",
    "-7.0001",
    "-1.0001",
    "+20.00",
  ]);
});
