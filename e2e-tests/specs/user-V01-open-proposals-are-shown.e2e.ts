/**
 * Creates a proposal and verifies that a user can see it, without changing filters.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { Header } from "../components/header";
import { ProposalsTab } from "../components/proposals-tab";
import { Capabilities } from "@wdio/types";

describe("Makes a proposal and verifies that it is shown", () => {
  let proposalId: number | undefined = undefined;

  before(function () {
    const compatibleBrowsers = ["chrome"];
    if (
      !compatibleBrowsers.includes(
        (browser.capabilities as Capabilities.Capabilities).browserName ??
          "unknown"
      )
    )
      this.skip();
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
    await navigator.click(
      Header.TAB_TO_PROPOSALS_SELECTOR,
      "Go to the neurons tab"
    );
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
    await navigator.click(
      ProposalsTab.BACK_TO_PROPOSAL_LIST_SELECTOR,
      "Go back to proposal list"
    );
  });
});
