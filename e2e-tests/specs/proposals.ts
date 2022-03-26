import { register } from '../common/register';
import { logout } from '../common/logout';
import { loginWithIdentity } from '../common/login';
import { getLoginButton } from '../components/auth';
import { waitForImages } from '../common/waitForImages';
import { waitForLoad } from '../common/waitForLoad';
import { getLogoutButton, getVotingTabButton } from '../components/header.ts';

describe("landing page", () => {
  const nns_tabs = [];

  it("login", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await loginWithIdentity(browser, "10000");
  });

  it("navigateToVotingTab", async () => {
    let votingTabButton = await getVotingTabButton(browser);
    await votingTabButton.waitForExist();
    await votingTabButton.click();
    await browser["screenshot"]("voting-page");
  });

  it("canShowAllProposals", async () => {
    const result = await browser.execute(() =>
      document.querySelectorAll('.filters button')
    );

    console.log(result);
  });
});
