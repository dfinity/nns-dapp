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
  await createDummyProposal(appPo);

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
