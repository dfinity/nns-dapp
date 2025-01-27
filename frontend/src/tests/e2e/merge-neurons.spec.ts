import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test merge neurons", async ({ page, context }) => {
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
  await appPo.getIcpTokens(20);

  step("Go to the staking tab");
  await appPo.goToStaking();

  step("Stake a neuron");
  const initialStake1 = 1;
  const dissolveDelayDays1 = 3 * 365;
  await appPo.getStakingPo().stakeFirstNnsNeuron({
    amount: initialStake1,
    dissolveDelayDays: dissolveDelayDays1,
  });

  const neuronsPo = appPo.getNeuronsPo().getNnsNeuronsPo();
  const footerPo = appPo.getNeuronsPo().getNnsNeuronsFooterPo();
  await neuronsPo.waitFor();

  const neuronId1 = (await neuronsPo.getNeuronIds())[0];

  step("Stake a second neuron");
  const stake2 = 7;
  const dissolveDelayDays2 = 7 * 365;
  await footerPo.stakeNeuron({
    amount: stake2,
    dissolveDelayDays: dissolveDelayDays2,
  });
  const neuronId2 = (await neuronsPo.getNeuronIds())[0];

  expect(
    Number(
      await (
        await neuronsPo.getNeuronsTablePo().getNeuronsTableRowPo(neuronId1)
      ).getStakeBalance()
    )
  ).toBe(initialStake1);
  expect(
    Number(
      await (
        await neuronsPo.getNeuronsTablePo().getNeuronsTableRowPo(neuronId2)
      ).getStakeBalance()
    )
  ).toBe(stake2);

  step("Increase stake on first neuron");
  const finalStake1 = 3;
  await appPo.goToNeuronDetails(neuronId1);
  await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .increaseStake({ amount: finalStake1 - initialStake1 });

  step("Merge neurons");
  await appPo.goToNnsNeurons();

  await footerPo.mergeNeurons({
    sourceNeurondId: neuronId1,
    targetNeuronId: neuronId2,
  });

  // The stake is also reduced by the transaction fee, but the difference isn't
  // visible after rounding.
  expect(
    Number(
      await (
        await neuronsPo.getNeuronsTablePo().getNeuronsTableRowPo(neuronId2)
      ).getStakeBalance()
    )
  ).toBe(finalStake1 + stake2);

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
    [
      "Sent", // This would be "Top-up Neuron" but we don't know the neuron anymore.
      "Staked",
      "Sent", // This would be "Staked" but we don't know the neuron anymore.
      "Received",
    ]
  );
  expect(await Promise.all(transactions.map((tx) => tx.getAmount()))).toEqual([
    "-2.0001",
    "-7.0001",
    "-1.0001",
    "+20.00",
  ]);
});
