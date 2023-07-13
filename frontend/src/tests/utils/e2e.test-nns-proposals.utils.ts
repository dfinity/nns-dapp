import type { AppPo } from "$tests/page-objects/App.page-object";
import { getNnsNeuronCardsIds } from "$tests/utils/e2e.test-nns-neuron-utils";
import { step } from "$tests/utils/e2e.test-utils";
import { expect } from "@playwright/test";

/** Creates dummy proposals
 * - needs at least 10 ICPs
 * 1. stake a neuron
 * 2. use the neuron to create dummy proposals
 * 3. disburse the neuron
 */
export const createDummyProposal = async (appPo: AppPo) => {
  const localStep = (message: string) =>
    step(`Create a dummy proposal > ${message}`);

  await localStep("Goto neurons tab");
  await appPo.goToNeurons();
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();

  await localStep("Stake a neuron to create dummy proposals");
  const idsBeforeRun = await getNnsNeuronCardsIds(appPo);

  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 10, dissolveDelayDays: "max" });

  const idsAfterNeuronCreation = await getNnsNeuronCardsIds(appPo);
  expect(idsAfterNeuronCreation).toHaveLength(idsBeforeRun.length + 1);

  const newNeuronId = idsAfterNeuronCreation.find(
    (id: string) => !idsBeforeRun.includes(id)
  );

  await localStep("Open neuron details");
  await appPo.goToNeuronDetails(newNeuronId);

  await localStep("Create dummy proposals");
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().createDummyProposals();

  await appPo.goBack();
};
