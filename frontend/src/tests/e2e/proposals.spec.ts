import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { createDummyProposal } from "$tests/utils/e2e.nns-proposals.test-utils";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { ProposalStatus, Topic } from "@dfinity/nns";
import { expect, test } from "@playwright/test";

test("Test neuron voting", async ({ page, context }) => {
  await page.goto("/accounts");
  await expect(page).toHaveTitle("My Tokens / NNS Dapp");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.goToAccounts();
  await appPo.getIcpTokens(21);

  // should be created before dummy proposals
  step("Stake a neuron for voting");
  await appPo.goToNeurons();
  await appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .stakeNeuron({ amount: 10, dissolveDelayDays: "max" });

  step("Create dummy proposals");
  const proposerNeuronId = await createDummyProposal(appPo);

  step("Open proposals list");
  await appPo.goToProposals();
  const nnsProposalListPo = appPo.getProposalsPo().getNnsProposalListPo();
  await nnsProposalListPo.waitForContentLoaded();

  /*
   * Test proposal filters
   */
  step("Open proposals list");
  await appPo.goToProposals();
  await nnsProposalListPo.waitForContentLoaded();

  step("Filter proposals by Votable only");
  // Hide proposals that are not votable
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setVotableProposalsOnlyValue(true);
  await nnsProposalListPo.waitForContentLoaded();
  const proposalIdsBeforeVoting =
    await nnsProposalListPo.getVisibleProposalIds();
  step("Vote for a proposal");
  const proposalCardForVoting =
    await nnsProposalListPo.getFirstProposalCardPoForStatus("Open");
  const proposalIdForVoting = await proposalCardForVoting.getProposalId();
  // Open proposal details
  await proposalCardForVoting.click();
  await appPo.getProposalDetailPo().getNnsProposalPo().waitForContentLoaded();
  // Vote on proposal
  await appPo.getProposalDetailPo().getNnsProposalPo().waitForContentLoaded();
  await appPo
    .getProposalDetailPo()
    .getNnsProposalPo()
    .getVotingCardPo()
    .voteYes();
  // Back to proposals list
  await appPo.goBack();
  await nnsProposalListPo.waitForContentLoaded();
  const proposalIdsAfterVoting =
    await nnsProposalListPo.getVisibleProposalIds();

  step("Voted proposal should be hidden");
  expect(proposalIdsAfterVoting).toHaveLength(
    proposalIdsBeforeVoting.length - 1
  );
  expect(proposalIdsBeforeVoting).toContain(proposalIdForVoting);
  expect(proposalIdsAfterVoting).not.toContain(proposalIdForVoting);

  // switch filter back
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setVotableProposalsOnlyValue(false);
  await nnsProposalListPo.waitForContentLoaded();
  // check that all proposals are visible again

  step("Voted proposal should be visible again");
  expect(await nnsProposalListPo.getVisibleProposalIds()).toEqual(
    proposalIdsBeforeVoting
  );

  step("Filter proposals by Topic");
  const getVisibleCardTopics = () => nnsProposalListPo.getCardTopics();

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectTopicFilter([Topic.ExchangeRate]);
  await nnsProposalListPo.waitForContentLoaded();

  expect(await getVisibleCardTopics()).toEqual(["Exchange Rate"]);

  // Invert topic filter
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectAllTopicsExcept([Topic.ExchangeRate]);
  await nnsProposalListPo.waitForContentLoaded();

  expect((await getVisibleCardTopics()).includes("Exchange Rate")).toBe(false);

  step("Filter proposals by Status");
  const getVisibleCardStatuses = () => nnsProposalListPo.getCardStatuses();

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectStatusFilter([ProposalStatus.Open]);
  await nnsProposalListPo.waitForContentLoaded();

  expect(await getVisibleCardStatuses()).toEqual(["Open"]);

  // Invert status filter
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectAllStatusesExcept([ProposalStatus.Open]);
  await nnsProposalListPo.waitForContentLoaded();

  expect(await getVisibleCardStatuses()).not.toContain("Open");

  /*
   * Validate proposal details
   */

  step("Filter Open Governance proposals");
  // Filter by topic and status to get less proposals
  // in case of a multiple dummy proposals created before calling this test
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectTopicFilter([Topic.Governance]);
  await nnsProposalListPo.waitForContentLoaded();
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectStatusFilter([ProposalStatus.Open]);
  await nnsProposalListPo.waitForContentLoaded();
  // be sure that "votable proposals only" filter is off
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setVotableProposalsOnlyValue(false);
  await nnsProposalListPo.waitForContentLoaded();

  step("Open proposal details");
  const governanceProposalCard =
    await nnsProposalListPo.getFirstProposalCardPoForStatus("Open");

  await governanceProposalCard.click();
  await appPo.getProposalDetailPo().getNnsProposalPo().waitForContentLoaded();

  step("Check proposal details");
  const nnsProposalPo = appPo.getProposalDetailPo().getNnsProposalPo();

  // System info
  const systemInfoSectionPo =
    nnsProposalPo.getProposalProposalSystemInfoSectionPo();

  expect(await systemInfoSectionPo.getProposalTypeText()).toBe("Motion");
  expect(await systemInfoSectionPo.getProposalTopicText()).toBe("Governance");
  expect(await systemInfoSectionPo.getProposalStatusText()).toBe("Open");
  expect(await systemInfoSectionPo.getProposalRewardText()).toBe(
    "Accepting Votes"
  );
  expect(await systemInfoSectionPo.getProposalProposerNeuronIdText()).toBe(
    proposerNeuronId
  );

  // Votes result
  expect(
    await nnsProposalPo.getVotesResultPo().getAdoptVotingPower()
  ).toBeGreaterThan(0);
  expect(await nnsProposalPo.getVotesResultPo().getRejectVotingPower()).toBe(0);

  // Summary
  expect(await nnsProposalPo.getProposalSummaryPo().getProposalTitle()).toMatch(
    /^Test proposal title - Lower all prices!/
  );
  expect(await nnsProposalPo.getProposalSummaryPo().getProposalUrlText()).toBe(
    "https://forum.dfinity.org/t/announcing-juno-build-on-the-ic-using-frontend-code-only"
  );

  // Actions
  expect(
    await nnsProposalPo.getProposalProposerActionsEntryPo().getActionTitle()
  ).toBe("Motion");
  expect(
    await nnsProposalPo.getProposalProposerActionsEntryPo().getJsonPos()
  ).toHaveLength(1);

  await appPo.goBack();
});
