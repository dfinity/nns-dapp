import { register } from '../common/register';
import { logout } from '../common/logout';
import { loginWithIdentity } from '../common/login';
import { getLoginButton } from '../components/auth';
import { waitForImages } from '../common/waitForImages';
import { waitForLoad } from '../common/waitForLoad';
import { getLogoutButton } from '../components/header.ts';

describe("landing page", () => {
  const nns_tabs = [];

  it("login", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await loginWithIdentity(browser, "10000");
  });

  it("navigateToVotingTab", async () => {
    let votingTabButton = await browser.$('[data-tid="tab-proposals"]');
    await votingTabButton.waitForExist();
    await votingTabButton.click();
    await browser["screenshot"]("voting-page");
  });
});
