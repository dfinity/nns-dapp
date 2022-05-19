/**
 * Creates a proposal and verifies that a user can see it, without chnaging filters.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { Header } from "../components/header";
import { ProposalsTab } from "../components/proposals-tab";
import { execFile } from "node:child_process";

describe("Makes a proposal and verifies that it is shown", () => {
  let proposalId: number | undefined = undefined;

  it("Setup: Register user", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.error(`Created user: ${JSON.stringify(userId)}`);
  });

  it("Setup: Create proposal", async () => {
    proposalId = await new Promise((yay, nay) =>
      execFile(
        "../scripts/propose",
        ["--to", "set-firewall-config", "--jfdi"],
        {},
        (error, stdout, stderr) => {
          if (null !== error) {
            nay(stderr);
          } else {
            console.error("stdout:", stdout);
            console.error("stderr:", stderr);
            const proposalId = Number(
              stdout
                .split(/[\n\r]/)
                .map((line) => line.split(/[ \t]+/))
                .filter(
                  (fields) => fields.length === 2 && fields[0] === "proposal"
                )
                .map((fields) => fields[1])[0]
            );
            if (Number.isSafeInteger(proposalId)) {
              yay(proposalId);
            } else {
              nay(new Error(`No proposal was made.\nstdout:\n${stdout}`));
            }
          }
        }
      )
    );
    console.error(`Proposed proposalId ${proposalId}`);
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
    console.error({ proposalId });
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
