import { loginWithIdentity } from "../common/login";
import { waitForLoad } from "../common/waitForLoad";
import { getVotingTabButton } from "../components/header.ts";

describe("viewProposals", () => {
  it("login", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await loginWithIdentity(browser, "10000");
  });

  it("navigateToVotingTab", async () => {
    const votingTabButton = await getVotingTabButton(browser);
    await votingTabButton.waitForExist();
    await votingTabButton.click();
    await browser["screenshot"]("voting-page");
  });

  it("canShowAllProposals", async () => {
    const result = await browser.execute(() =>
      document.querySelectorAll(".filters button")
    );

    console.log(result);
  });
});
