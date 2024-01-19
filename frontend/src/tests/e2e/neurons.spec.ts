import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { getNnsNeuronCardsIds } from "$tests/utils/e2e.nns-neuron.test-utils";
import { createDummyProposal } from "$tests/utils/e2e.nns-proposals.test-utils";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test neuron voting", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
  // TODO: GIX-1985 Remove this once the feature flag is enabled by default
  await setFeatureFlag({ page, featureFlag: "ENABLE_MY_TOKENS", value: true });
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(41);

  // should be created before dummy proposals
  step("Stake neuron (for voting)");
  await appPo.goToNeurons();
  const stake = 15;
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: stake, dissolveDelayDays: "max" });

  const neuronIds = await getNnsNeuronCardsIds(appPo);
  expect(neuronIds).toHaveLength(1);
  const neuronId = neuronIds[0];

  step("Create dummy proposals");
  const proposer = await createDummyProposal(appPo);

  step("Go to the neurons tab");
  await appPo.goToNeurons();
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();

  // get neuron
  step("Open neuron details");
  await appPo.goToNeuronDetails(neuronId);

  step("Get neuron voting power");
  const neuronAVotingPower = Number(
    await appPo
      .getNeuronDetailPo()
      .getNnsNeuronDetailPo()
      .getVotingPowerSectionPo()
      .getVotingPower()
  );

  // vp=stake*2 when max dissolve delay (https://support.dfinity.org/hc/en-us/articles/4404284534420-What-is-voting-power-)
  expect(neuronAVotingPower).toBe(stake * 2);
  // back to neurons otherwise the menu is not available
  await appPo.goBack();

  step("Open proposals list");
  await appPo.goToProposals();
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();
  const proposalIds = await appPo
    .getProposalsPo()
    .getNnsProposalListPo()
    .getProposalIds();

  expect(proposalIds.length).toBeGreaterThan(0);

  step("Open first proposal");
  const proposalCard = await appPo
    .getProposalsPo()
    .getNnsProposalListPo()
    .getFirstProposalCardPoForProposer(proposer);
  await proposalCard.click();
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

  expect(changedAdoptVotingPower).toEqual(
    initialAdoptVotingPower + neuronAVotingPower
  );
});
