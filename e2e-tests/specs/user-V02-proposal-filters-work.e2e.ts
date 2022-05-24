/**
 * Creates a proposal and verifies that a user can see it, without changing filters.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { Header } from "../components/header";
import { ProposalsTab } from "../components/proposals-tab";

describe("Makes a proposal and verifies that the filters work", () => {
  let proposalId: number | undefined = undefined;

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

  it("Can see the new proposal if open proposals are selected", async () => {
    const proposalsTab = new ProposalsTab(browser);
    await proposalsTab.filter("filters-by-status", ["Open", "Failed"]);
    const proposalMetadataSelector = ProposalsTab.proposalIdSelector(
      proposalId as number
    );
    await proposalsTab.getElement(
      proposalMetadataSelector,
      "Proposal should appear, it it was not already displayed"
    );
    const disappears = await proposalsTab
      .waitForGone(proposalMetadataSelector, "Seeing if it disappears", {
        timeout: 1_000,
      })
      .then(() => true)
      .catch(() => false);
    expect(disappears).toBe(false);
  });
  it("Can not see the new proposal if open proposals are deselected", async () => {
    const proposalsTab = new ProposalsTab(browser);
    await proposalsTab.filter("filters-by-status", ["Open", "Failed"], false);
    const proposalMetadataSelector = ProposalsTab.proposalIdSelector(
      proposalId as number
    );
    await proposalsTab.waitForGone(
      proposalMetadataSelector,
      "Proposal should disappear",
      { timeout: 10_000 }
    );
    const appears = await proposalsTab
      .getElement(proposalMetadataSelector, "Seeing if it appears", {
        timeout: 1_000,
      })
      .then(() => true)
      .catch(() => false);
    expect(disappears).toBe(false);
  });
});
