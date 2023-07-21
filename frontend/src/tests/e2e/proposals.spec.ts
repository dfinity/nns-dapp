import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { createDummyProposal } from "$tests/utils/e2e.nns-proposals.test-utils";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { ProposalStatus, Topic } from "@dfinity/nns";
import { expect, test } from "@playwright/test";

test("Test neuron voting", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("NNS Dapp");

  // await signInWithAnchor({ page, context, anchor: 10000, skipRecovery: true });
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.goToAccounts();
  // We need an account before we can get ICP.
  await appPo
    .getAccountsPo()
    .getNnsAccountsPo()
    .getMainAccountCardPo()
    .waitFor();
  await appPo.getTokens(26);

  step("Create dummy proposals");
  await createDummyProposal(appPo);

  step("Open proposals list");

  await appPo.goToProposals();
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  step(`Filter proposals by Topic (ExchangeRate)`);
  const visibleCardTopics = async () =>
    await appPo.getProposalsPo().getNnsProposalListPo().getProposalCardTopics();

  expect(Array.from(new Set(await visibleCardTopics())).length).toBeGreaterThan(
    1
  );

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setTopicFilter([Topic.ExchangeRate]);
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  expect(Array.from(new Set(await visibleCardTopics()))).toHaveLength(1);

  step("Filter by status");
  const visibleCardStatuses = () =>
    appPo.getProposalsPo().getNnsProposalListPo().getProposalCardStatuses();
  // Open status cards are visible
  expect(await visibleCardStatuses()).toContain("Open");

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .setStatusFilter([ProposalStatus.Executed]);
  await appPo.getProposalsPo().getNnsProposalListPo().waitForContentLoaded();

  expect(await visibleCardStatuses()).not.toContain("Open");
});
