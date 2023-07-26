import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { createDummyProposal } from "$tests/utils/e2e.nns-proposals.test-utils";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { ProposalStatus, Topic } from "@dfinity/nns";
import { expect, test } from "@playwright/test";

test("Test neuron voting", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("NNS Dapp");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.goToAccounts();
  await appPo.getTokens(26);

  step("Create dummy proposals");
  await createDummyProposal(appPo);

  step("Open proposals list");
  await appPo.goToProposals();
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  step(`Filter proposals by Topic`);
  const getVisibleCardTopics = () =>
    appPo.getProposalsPo().getNnsProposalListPo().getProposalCardTopics();
  const initialVisibleCardTopics = await getVisibleCardTopics();

  expect((await getVisibleCardTopics()).length).toBeGreaterThan(1);

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setTopicFilter([Topic.ExchangeRate]);
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  expect(await getVisibleCardTopics()).toHaveLength(1);
  expect((await getVisibleCardTopics())[0]).toEqual("Exchange Rate");

  // Reset topic filter
  await appPo.getProposalsPo().getNnsProposalFiltersPo().setTopicFilter([]);
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();
  expect((await getVisibleCardTopics()).length).toBeGreaterThanOrEqual(
    initialVisibleCardTopics.length
  );

  step("Filter proposals by Status");
  const getVisibleCardStatuses = () =>
    appPo.getProposalsPo().getNnsProposalListPo().getProposalCardStatuses();
  // Open status cards are visible
  expect(await getVisibleCardStatuses()).toContain("Open");

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setStatusFilter([ProposalStatus.Executed]);
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  expect(await getVisibleCardStatuses()).not.toContain("Open");
});
