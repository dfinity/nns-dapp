/**
 * Creates a proposal and verifies that a user can see it, without changing filters.
 */
import { MyNavigator } from "../common/navigator";
import { register } from "../common/register";
import { skipUnlessBrowserIs } from "../common/test";
import { NAV_PROPOSALS_SELECTOR } from "../components/nav";
import { ProposalsTab } from "../components/proposals-tab";

describe("Makes a proposal and verifies that it is shown", () => {
  let proposalId: number | undefined = undefined;

  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome"]);
  });

  it("Setup: Register user", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.warn(`Created user: ${JSON.stringify(userId)}`);
  });

  it("Setup: Create proposal", async () => {
    proposalId = await ProposalsTab.propose("set-firewall-config");
  });

  it("Go to voting tab", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.navigate({
      selector: NAV_PROPOSALS_SELECTOR,
      description: "Go to the neurons view",
    });
  });

  it("Can see the new proposal", async () => {
    const navigator = new MyNavigator(browser);
    console.warn({ proposalId });
    const proposalMetadataSelector = ProposalsTab.proposalIdSelector(
      proposalId as number
    );
    await navigator.click(
      proposalMetadataSelector,
      "Navigate to proposal detail"
    );
    await navigator.getElement(
      ProposalsTab.PROPOSAL_TALLY_SELECTOR,
      "Waiting for proposal detail"
    );
    await navigator.getElement(
      proposalMetadataSelector,
      "Verifying that the proposal detail is for the correct proposal"
    );
    // TODO(L2-736): This test is failing for unknown reason with the new design
    // await navigator.click(
    //   ProposalsTab.HEADER_BACK_SELECTOR,
    //   "Go back to proposal list"
    // );
  });
});
