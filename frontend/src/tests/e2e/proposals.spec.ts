import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { getNnsNeuronCardsIds } from "$tests/utils/e2e.nns-neuron.test-utils";
import { createDummyProposal } from "$tests/utils/e2e.nns-proposals.test-utils";
import { signInWithAnchor, step } from "$tests/utils/e2e.test-utils";
import { ProposalStatus, Topic } from "@dfinity/nns";
import { expect, test } from "@playwright/test";

test("Test neuron voting", async ({ page, context }) => {
  console.log(Array.from(new Set([Topic.ExchangeRate, Topic.ExchangeRate])));

  await page.goto("/");
  await expect(page).toHaveTitle("NNS Dapp");
  await signInWithAnchor({ page, context, anchor: 10000, skipRecovery: true });
  // await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Check current proposals");
  await appPo.goToProposals();
  await appPo.getProposalsPo().waitForContentLoaded();

  const initialProposalIds = await appPo
    .getProposalsPo()
    .getNnsProposalListPo()
    .getProposalIds();

  console.log("initialProposalIds", initialProposalIds);

  step("Get some ICP");
  await appPo.goToAccounts();
  // We need an account before we can get ICP.
  await appPo
    .getAccountsPo()
    .getNnsAccountsPo()
    .getMainAccountCardPo()
    .waitFor();
  await appPo.getTokens(26);

  // should be created before dummy proposals
  step("Stake neuron (for voting)");
  await appPo.goToNeurons();
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();
  const initialNeuronIds = await getNnsNeuronCardsIds(appPo);

  const stake = 15;
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: stake, dissolveDelayDays: "max" });

  const neuronIds = await getNnsNeuronCardsIds(appPo);
  expect(neuronIds).toHaveLength(initialNeuronIds.length + 1);
  // neurons are sorted by age, so the first one is the new one
  const neuronId = neuronIds[0];

  step("Create dummy proposals");
  await createDummyProposal(appPo);

  step("Go to the neurons tab");
  await appPo.goToNeurons();
  await appPo.getNeuronsPo().getNnsNeuronsPo().waitForContentLoaded();

  // get neuron
  // step("Open neuron details");
  // await appPo.goToNeuronDetails(neuronId);
  // step("Get neuron voting power");
  // const neuronAVotingPower = await appPo
  //   .getNeuronDetailPo()
  //   .getNnsNeuronDetailPo()
  //   .getNnsNeuronMetaInfoCardPageObjectPo()
  //   .getVotingPower();
  // // back to neurons otherwise the menu is not available
  // await appPo.goBack();

  step("Open proposals list");

  await appPo.goToProposals();
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();
  const proposalIds = await appPo
    .getProposalsPo()
    .getNnsProposalListPo()
    .getProposalIds();
  const newProposaIds = proposalIds.filter(
    (id) => !initialProposalIds.includes(id)
  );
  console.log("proposalIds", proposalIds);
  console.log("newProposaIds", newProposaIds);

  // TODO: refactor: move to NnsProposalListPo
  const getVisibleCardTopics = async () =>
    await Promise.all(
      (
        await appPo.getProposalsPo().getNnsProposalListPo().getProposalCardPos()
      ).map((card) => card.getProposalTopicText())
    );
  const getVisibleCardStatuses = async () =>
    await Promise.all(
      (
        await appPo.getProposalsPo().getNnsProposalListPo().getProposalCardPos()
      ).map((card) => card.getProposalTopicText())
    );

  // Different topics are visible
  expect(
    (await getVisibleCardTopics()).find((topic) => topic !== "Exchange Rate")
  ).toBeDefined();

  // Different statuses are visible
  expect(
    (await getVisibleCardStatuses()).find((status) => status !== "Open")
  ).toBeDefined();

  step(`Filter for "Exchange Rate" proposals`);

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setTopicFilter([Topic.ExchangeRate]);

  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  // Only "Exchange Rate" topic cards are visible
  expect(
    (await getVisibleCardTopics()).find((topic) => topic !== "Exchange Rate")
  ).toBeDefined();

  step(`Filter for "Open" proposals`);

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setStatusFilter([ProposalStatus.Open]);

  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  // Only "Exchange Rate" topic cards are visible
  expect(
    (await getVisibleCardTopics()).find((topic) => topic !== "Exchange Rate")
  ).toBeDefined();

  // Only "Open" status cards are visible
  expect(
    (await getVisibleCardStatuses()).find((status) => status !== "Open")
  ).toBeDefined();

  const proposalsAfterFilter = await appPo
    .getProposalsPo()
    .getNnsProposalListPo()
    .getProposalIds();

  console.log("proposalsAfterFilter", proposalsAfterFilter);

  /*

  // await proposalsTab.filter("filters-by-status", ["Open", "Failed"]);
  // Set to the filter of the proposal type.
  // await proposalsTab.filter("filters-by-topics", ["Subnet Management"]);

  const newProposalIndex = proposalIds.indexOf(newProposaIds[0]);
  expect(newProposalIndex).toBeGreaterThan(-1);

  expect(proposalIds.length).toBeGreaterThan(0);

  step("Can see just created proposal");

  await (
    await appPo.getProposalsPo().getNnsProposalListPo().getProposalCardPos()
  )[newProposalIndex].click();
  const proposalDetails = appPo.getProposalDetailPo().getNnsProposalPo();
  await proposalDetails.waitForContentLoaded();
  const initialAdoptVotingPower = await proposalDetails
    .getVotesResultPo()
    .getAdoptVotingPower();
  */

  // OLD:
  // step("Open proposal details");
  // step("Vote for proposal");
  // await proposalDetails.getVotingCardPo().voteYes();

  // step("Compare voting power before and after voting");
  // const changedAdoptVotingPower = await proposalDetails
  //   .getVotesResultPo()
  //   .getAdoptVotingPower();

  // expect(changedAdoptVotingPower).toEqual(
  //   initialAdoptVotingPower + neuronAVotingPower
  // );
});
