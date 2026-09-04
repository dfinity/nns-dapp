import { MAX_EXPANDED_JSON_DEPTH } from "$lib/constants/proposals.constants";
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

// The proposer writes every text field of a proposal payload. The proposal
// detail page used to call `JSON.parse` on each string field and then walk the
// result with a recursive function, so a compact text such as
// "[[[[..." became a structure thousands of levels deep. The walk threw
// `RangeError: Maximum call stack size exceeded` inside a reactive statement,
// and the payload card, together with the rest of the detail page, stopped
// rendering. A proposal cannot be edited, so the page stayed broken for good.
//
// This test submits a real ExecuteNnsFunction proposal whose
// `replica_version_id` text nests 34,000 levels, then reads the payload card.
// The text must show as the quoted string it is, and the page must work.
//
// Why ExecuteNnsFunction and not a Motion: governance caps a Motion text at
// 10,000 bytes, which is at most 5,000 levels. The measured overflow threshold
// is 6,205 levels in Chrome 152, so a Motion text cannot reach the bug. The
// ExecuteNnsFunction payload cap is 70,000 bytes, which is far above it.
const NESTING_DEPTH = 34_000;
const DEEP_TEXT = `${"[".repeat(NESTING_DEPTH)}${"]".repeat(NESTING_DEPTH)}`;

// The app loads this script to create the dummy proposals of a testnet. The
// test serves its own version, so that one proposal carries the payload above.
// See frontend/src/lib/api/dev.api.ts and
// frontend/static/assets/libs/dummy-proposals.utils.js.
const DUMMY_PROPOSALS_SCRIPT_PATH = "**/assets/libs/dummy-proposals.utils.js";

const PROPOSAL_TITLE = "Test proposal title - a deeply nested payload text";

// A hand encoded candid argument for NNS function 11
// (DeployGuestosToAllSubnetNodes). It holds the same subnet id as the dummy
// proposal in the repo and a `replica_version_id` of our own. The full message
// is 68,055 bytes, under the 70,000 byte cap that governance applies.
const dummyProposalsModule = `
const SUBNET_ID_BYTES = [
  106, 143, 103, 216, 110, 204, 131, 7, 4, 128, 56, 173, 113, 89, 148, 88, 193,
  49, 181, 49, 220, 155, 176, 182, 145, 148, 13, 185, 2,
];

const leb128 = (value) => {
  const bytes = [];
  let rest = value;
  do {
    let byte = rest & 0x7f;
    rest >>>= 7;
    if (rest !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (rest !== 0);
  return bytes;
};

const deployGuestosPayload = (replicaVersionId) => {
  const textBytes = Array.from(new TextEncoder().encode(replicaVersionId));
  return new Uint8Array([
    68, 73, 68, 76, // "DIDL"
    1, // one type in the table
    108, 2, // a record with two fields
    189, 134, 157, 139, 4, 104, // subnet_id : principal
    201, 239, 142, 197, 9, 113, // replica_version_id : text
    1, 0, // one argument of type 0
    1, SUBNET_ID_BYTES.length, ...SUBNET_ID_BYTES,
    ...leb128(textBytes.length), ...textBytes,
  ]);
};

export const makeDummyProposals = async ({ neuronId, canister }) => {
  await canister.makeProposal({
    neuronId,
    title: ${JSON.stringify(PROPOSAL_TITLE)},
    url: "https://forum.dfinity.org/t/announcing-juno-build-on-the-ic-using-frontend-code-only",
    summary: "A proposal whose payload text nests JSON thousands of levels deep.",
    action: {
      ExecuteNnsFunction: {
        nnsFunctionId: 11,
        nnsFunctionName: undefined,
        payload: {},
        payloadBytes: deployGuestosPayload(${JSON.stringify(DEEP_TEXT)}),
      },
    },
  });
};
`;

test("Test a proposal payload text that nests JSON thousands of levels deep", async ({
  page,
  context,
}) => {
  await step("Serve a dummy proposal whose payload text nests deeply");
  await page.route(DUMMY_PROPOSALS_SCRIPT_PATH, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: dummyProposalsModule,
    })
  );

  await page.goto("/");
  await disableCssAnimations(page);
  await expect(page).toHaveTitle("Portfolio | Network Nervous System");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  await step("Get some ICP");
  await appPo.getIcpTokens(21);

  await step("Stake a neuron for voting");
  await appPo.goToStaking();
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: 10, dissolveDelayDays: "max" });

  await step("Create the proposal");
  const proposerNeuronId = await createDummyProposal(appPo);

  await step("Open the Internet Computer proposals");
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

  await step("Filter the open Subnet Management proposals");
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectTopicFilter([Topic.SubnetManagement]);
  await nnsProposalListPo.waitForContentLoaded();
  await appPo
    .getProposalsPo()
    .getNnsProposalFiltersPo()
    .selectStatusFilter([ProposalStatus.Open]);
  await nnsProposalListPo.waitForContentLoaded();

  await step("Open the proposal");
  const proposalCard =
    await nnsProposalListPo.getFirstProposalCardPoForProposer(proposerNeuronId);
  await proposalCard.click();
  const nnsProposalPo = appPo.getProposalDetailPo().getNnsProposalPo();
  await nnsProposalPo.waitForContentLoaded();

  await step("Read the payload card");
  // Before the fix the reactive statement in JsonPreview.svelte threw here, so
  // this card never appeared.
  const payloadPo = nnsProposalPo.getProposalProposerActionsEntryPo();
  await payloadPo.waitFor();
  expect(await payloadPo.getActionTitle()).toBe("Payload");

  const jsonPreviewPo = payloadPo.getJsonPreviewPo();
  const togglePo = payloadPo.getJsonRepresentationModeTogglePo();

  await step("Read the tree view");
  await togglePo.setEnabled(false);
  await jsonPreviewPo.getTreeJson().waitFor();
  const treeText = await jsonPreviewPo.getTreeText();

  // The text shows as the quoted string it is, the same as any string that is
  // not JSON.
  expect(treeText).toContain(`"${"[".repeat(MAX_EXPANDED_JSON_DEPTH)}`);
  expect(treeText).toContain(`${"]".repeat(MAX_EXPANDED_JSON_DEPTH)}"`);
  expect(treeText).toContain("replica_version_id");
  expect(treeText).not.toContain("Maximum call stack size exceeded");

  await step("Read the raw view");
  await togglePo.setEnabled(true);
  await jsonPreviewPo.getRawJson().waitFor();
  const rawText = await jsonPreviewPo.getRawText();
  const parsed = JSON.parse(rawText) as Record<string, unknown>;
  expect(Object.values(parsed)).toContain(DEEP_TEXT);

  await step("Check the rest of the detail page still works");
  // The throw broke the whole render and update cycle of the page, so the
  // voting controls of this proposal went with it.
  expect(await nnsProposalPo.getVotingCardPo().isPresent()).toBe(true);
  expect(
    await nnsProposalPo.getProposalSystemInfoSectionPo().getProposalTopicText()
  ).toBe("Subnet Management");
});
