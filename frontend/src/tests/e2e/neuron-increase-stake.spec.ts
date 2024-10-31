import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { getNnsNeuronCardsIds } from "$tests/utils/e2e.nns-neuron.test-utils";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test neuron increase stake", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(20);

  step("Stake neuron");
  await appPo.goToStaking();
  const initialStake = 10;
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: initialStake, dissolveDelayDays: "max" });
  await appPo.getNeuronsPo().waitFor();

  const neuronIds = await getNnsNeuronCardsIds(appPo);
  expect(neuronIds).toHaveLength(1);
  const neuronId = neuronIds[0];

  step("Open neuron details");
  await appPo.goToNeuronDetails(neuronId);

  step("Get neuron voting power");
  const neuronStake1 = Number(
    await appPo
      .getNeuronDetailPo()
      .getNnsNeuronDetailPo()
      .getVotingPowerSectionPo()
      .getStake()
  );

  expect(neuronStake1).toBe(initialStake);

  step("Increase neuron stake");
  const increase1 = 5;
  await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .increaseStake({ amount: increase1 });

  const neuronStake2 = Number(
    await appPo
      .getNeuronDetailPo()
      .getNnsNeuronDetailPo()
      .getVotingPowerSectionPo()
      .getStake()
  );

  expect(neuronStake2).toBe(initialStake + increase1);

  step("Increase neuron stake with transfer to neuron account");
  const increase2 = 3;
  const neuronAccount = await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .getAdvancedSectionPo()
    .neuronAccount();

  await appPo.goToAccounts();
  await appPo.goToNnsMainAccountWallet();
  await appPo.getWalletPo().getNnsWalletPo().transferToAddress({
    destinationAddress: neuronAccount,
    amount: increase2,
  });

  await appPo.goToNeuronDetails(neuronId);
  // Reload the page to bypass checkedNeuronSubaccountsStore preventing
  // checking a neuron more than once per session.
  await page.reload();

  const toast = appPo.getToastsPo().getToastPo();
  await toast.waitFor();
  expect(await toast.getMessage()).toBe(
    "Your neuron's stake was refreshed successfully."
  );

  const neuronStake3 = Number(
    await appPo
      .getNeuronDetailPo()
      .getNnsNeuronDetailPo()
      .getVotingPowerSectionPo()
      .getStake()
  );
  expect(neuronStake3).toBe(initialStake + increase1 + increase2);
});
