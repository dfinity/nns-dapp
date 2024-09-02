import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { getNnsNeuronCardsIds } from "$tests/utils/e2e.nns-neuron.test-utils";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test neuron increase stake", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");
  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PROJECTS_TABLE",
    value: true,
  });
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

  // Increasing neuron stake is a 2-step process:
  // 1. Transfer ICP to the neuron account.
  // 2. Refresh the neuron.
  // These steps are normally performed by the frontend code, but it's
  // possible the process gets interrupted between steps 1 and 2.
  // To recover from this, the nns-dapp canister watches all
  // transactions to see if it needs to refresh any neurons.
  // This is why transferring ICP to the neuron account works to
  // increase the neuron stake.
  // When we switch to using ICRC-2 this is no longer necessary and
  // this test can be removed.
  step("Increase neuron stake with transfer to neuron account");
  const increase2 = 3;
  const neuronAccount = await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .getAdvancedSectionPo()
    .neuronAccount();

  await appPo.goBack();
  await appPo.goToAccounts();
  await appPo.goToNnsMainAccountWallet();
  await appPo.getWalletPo().getNnsWalletPo().transferToAddress({
    destinationAddress: neuronAccount,
    amount: increase2,
  });

  await appPo.goBack();
  await appPo.getAccountsPo().waitFor();
  await appPo.goBack();
  await appPo.goToNeuronDetails(neuronId);
  const neuronStake3 = Number(
    await appPo
      .getNeuronDetailPo()
      .getNnsNeuronDetailPo()
      .getVotingPowerSectionPo()
      .getStake()
  );
  expect(neuronStake3).toBe(initialStake + increase1 + increase2);
});
