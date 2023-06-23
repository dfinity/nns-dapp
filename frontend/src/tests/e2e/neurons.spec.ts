import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

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

  step("Stake neuron B (for dummy proposals creation)");
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: stake });

  step("Open neuron B details");

  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();
  const ids = await appPo.getNeuronsPo().getNnsNeuronsPo().getNeuronIds();

  if (ids.length === 0) {
    throw new Error("No neuron cards found");
  }

  // goto first neuron since it should be the one we just created
  await appPo.goToNeuronDetails(ids[0]);

  step("Create dummy proposal with neuron B");
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().createDummyProposals();

  step("Open proposals list");

  // back to /neurons otherwise the menu is not available
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

  expect(Number(changedAdoptVotingPower)).toBeGreaterThan(
    Number(initialAdoptVotingPower)
  );
});
