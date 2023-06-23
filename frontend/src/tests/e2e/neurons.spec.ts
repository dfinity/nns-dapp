import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const neuronIds = async (appPo: AppPo) =>
  await appPo.getNeuronsPo().getNnsNeuronsPo().getNeuronIds();

test("Test neuron management", async ({ page, context }) => {
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
  await appPo.getTokens(31);

  step("Go to the neurons tab");
  await appPo.goToNeurons();

  step("Stake neuron A (for voting)");
  const stake = 15;
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: stake });

  const idsAfterFirstNeuronCreation = await neuronIds(appPo);
  expect(idsAfterFirstNeuronCreation.length).toBe(1);

  step("Stake neuron B (for dummy proposals creation)");
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: stake });
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();

  // get neurons
  const idsAfterSecondNeuronCreation = await neuronIds(appPo);

  expect(idsAfterSecondNeuronCreation.length).toBe(2);

  const neuronAId = idsAfterFirstNeuronCreation[0];
  const neuronBId = idsAfterSecondNeuronCreation.find((id) => id !== neuronAId);

  step("Open neuron A details");
  await appPo.goToNeuronDetails(neuronAId);

  step("Get neuron A voting power");
  const neuronAVotingPower = await appPo
    .getNeuronDetailPo()
    .getNnsNeuronDetailPo()
    .getNnsNeuronMetaInfoCardPageObjectPo()
    .getVotingPower();
  // back to neurons otherwise the menu is not available
  await appPo.goBack();

  step("Open neuron B details");
  await appPo.goToNeuronDetails(neuronBId);

  step("Create dummy proposal with neuron B");
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().createDummyProposals();

  step("Open proposals list");
  // back to neurons otherwise the menu is not available
  await appPo.goBack();
  await appPo.goToProposals();
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();
  const proposalIds = await appPo
    .getProposalsPo()
    .getNnsProposalListPo()
    .getProposalIds();

  expect(proposalIds.length).toBeGreaterThan(0);

  step("Open first proposal");
  await (
    await appPo.getProposalsPo().getNnsProposalListPo().getProposalCardPos()
  )[0].click();
  const proposalDetails = appPo.getProposalDetailPo().getNnsProposalPo();
  await proposalDetails.waitForContentLoaded();
  const initialAdoptVotingPower = await proposalDetails
    .getVotesResultPo()
    .getAdoptVotingPower();

  step("Vote for proposal");
  await proposalDetails.getVotingCardPo().voteYes();

  step("Compare voting power before and after voting");
  const changedAdoptVotingPower = await proposalDetails
    .getVotesResultPo()
    .getAdoptVotingPower();

  expect(Number(changedAdoptVotingPower)).toEqual(
    Number(initialAdoptVotingPower) + Number(neuronAVotingPower)
  );
});
