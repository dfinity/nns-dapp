import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { createDummyProposal } from "$tests/utils/e2e.nns-proposals.test-utils";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { ProposalStatus, Topic } from "@icp-sdk/canisters/nns";
import { expect, test } from "@playwright/test";

// Whoever submits a proposal writes the payload of the proposal. The payload
// carries strings that the proposer chooses. `stringifyJson` used to serialize
// an absent value as the token below and then replace that token in the text,
// so a payload string equal to the token showed as the bare word `undefined`.
//
// This test submits a real proposal whose payload holds that string, then reads
// the three surfaces that show a payload: the tree view, the raw view and the
// copy button. On each surface the string must show as the plain quoted string
// it is.
//
// The unit tests in frontend/src/tests/lib/utils/utils.spec.ts cover the other
// shapes of the same attack: a key named after the token, and a value that
// carries a quote in front of the token.
const TOKEN = "__UNDEFINED__";

// The app loads this script to create the dummy proposals of a testnet. The
// test serves its own version, so that one proposal carries the payload above.
// See frontend/src/lib/api/dev.api.ts and
// frontend/static/assets/libs/dummy-proposals.utils.js.
const DUMMY_PROPOSALS_SCRIPT_PATH = "**/assets/libs/dummy-proposals.utils.js";

const dummyProposalsModule = `
export const makeDummyProposals = async ({ neuronId, canister }) => {
  await canister.makeProposal({
    neuronId,
    title: "Test proposal title - a token in the payload",
    url: "https://forum.dfinity.org/t/announcing-juno-build-on-the-ic-using-frontend-code-only",
    summary: "A proposal whose payload carries the token.",
    action: {
      Motion: {
        motionText: ${JSON.stringify(TOKEN)},
      },
    },
  });
};
`;

test("Test a proposal payload string that reads the undefined token", async ({
  page,
  context,
}) => {
  step("Serve a dummy proposal whose payload carries the token");
  await page.route(DUMMY_PROPOSALS_SCRIPT_PATH, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: dummyProposalsModule,
    })
  );

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/");
  await disableCssAnimations(page);
  await expect(page).toHaveTitle("Portfolio | Network Nervous System");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(21);

  step("Stake a neuron for voting");
  await appPo.goToStaking();
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: 10, dissolveDelayDays: "max" });

  step("Create the proposal");
  const proposerNeuronId = await createDummyProposal(appPo);

  step("Open the Internet Computer proposals");
  await appPo.goToProposals();
  await appPo.openUniverses();
  await appPo.getSelectUniverseListPo().clickOnInternetComputer();
  const nnsProposalListPo = appPo.getProposalsPo().getNnsProposalListPo();
  await nnsProposalListPo.waitForContentLoaded();

  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .getActionableProposalsSegmentPo()
    .clickAllProposals();

  step("Filter the open Governance proposals");
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

  step("Open the proposal");
  const proposalCard =
    await nnsProposalListPo.getFirstProposalCardPoForProposer(proposerNeuronId);
  await proposalCard.click();
  const nnsProposalPo = appPo.getProposalDetailPo().getNnsProposalPo();
  await nnsProposalPo.waitForContentLoaded();

  const payloadPo = nnsProposalPo.getProposalProposerActionsEntryPo();
  await payloadPo.waitFor();
  const jsonPreviewPo = payloadPo.getJsonPreviewPo();
  const togglePo = payloadPo.getJsonRepresentationModeTogglePo();

  step("Read the tree view");
  await togglePo.setEnabled(false);
  await jsonPreviewPo.getTreeJson().waitFor();
  const treeText = await jsonPreviewPo.getTreeText();

  // The tree view shows the plain quoted string. Before the fix it showed the
  // bare word `undefined`, so a set field read as an unset one.
  expect(treeText).toContain(`"${TOKEN}"`);
  expect(treeText).not.toContain("undefined");

  step("Read the raw view");
  await togglePo.setEnabled(true);
  await jsonPreviewPo.getRawJson().waitFor();
  const rawText = await jsonPreviewPo.getRawText();

  // The raw view is valid JSON. Before the fix it read `"motion_text":
  // undefined`, which is neither valid JSON nor the value the proposer set.
  expect(rawText).toContain(`"${TOKEN}"`);
  expect(rawText).not.toContain("undefined");
  const parsed = JSON.parse(rawText) as Record<string, unknown>;
  expect(Object.values(parsed)).toContain(TOKEN);

  step("Read the copy text");
  await payloadPo.getCopyButtonPo().click();
  const copyText = await page.evaluate(() => navigator.clipboard.readText());
  expect(copyText).toBe(rawText);
});
