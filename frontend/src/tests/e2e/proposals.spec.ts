import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { createDummyProposal } from "$tests/utils/e2e.nns-proposals.test-utils";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { Topic } from "@dfinity/nns";
import { expect, test } from "@playwright/test";

test("Test neuron voting", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("NNS Dapp");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.goToAccounts();
  await appPo.getIcpTokens(11);

  step("Create dummy proposals");
  const proposerNeuronId = await createDummyProposal(appPo);

  step("Open proposals list");
  await appPo.goToProposals();
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  /*
   * Validate proposal details
   */
  step("Open proposal details");
  const governanceProposalCard = await appPo
    .getProposalsPo()
    .getNnsProposalListPo()
    .getFirstProposalCardPoForTopic("Governance");
  expect(await governanceProposalCard.getProposalTopicText()).toBe(
    "Governance"
  );

  await governanceProposalCard.click();

  step("Check proposal details");
  await appPo.getProposalDetailPo().getNnsProposalPo().waitForContentLoaded();
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
  ).toBeLessThanOrEqual(20);
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

  /*
   * Test proposal filters
   */
  step("Open proposals list");
  await appPo.goToProposals();
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  step(`Filter proposals by Topic`);
  const getVisibleCardTopics = () =>
    appPo.getProposalsPo().getNnsProposalListPo().getCardTopics();

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectTopicFilter([Topic.ExchangeRate]);
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  expect(await getVisibleCardTopics()).toEqual(["Exchange Rate"]);

  // Invert topic filter
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectAllTopics([Topic.ExchangeRate]);
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  expect((await getVisibleCardTopics()).includes("Exchange Rate")).toBe(false);
});
