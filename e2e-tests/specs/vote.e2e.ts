import { register } from '../common/register';
import { logout } from '../common/logout';
import { loginWithIdentity } from '../common/login';
import { getLoginButton } from '../components/auth';
import { waitForImages } from '../common/waitForImages';
import { waitForLoad } from '../common/waitForLoad';
import { getLogoutButton, getVotingTabButton } from '../components/header.ts';

describe("vote", () => {

  it("login", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await loginWithIdentity(browser, "10000");
  });

  it("getIcp", () => {
    const getIcpButton = await browser.$('[data-tid="get-icp-button"]');
    await getIcpButton.waitForExist();
    await getIcpButton.click();
    const numIcp = await browser.$('[data-tid="get-icp-value"]');
    await numIcp.waitForExist();
    await numIcp.setValue("10");
    const submitButton = await browser.$('[data-tid="get-icp-submit"]');
    await submitButton.waitForExist();
    await submitButton.click();
  });

  it("navigateToVotingTab", async () => {
    const votingTabButton = await getVotingTabButton(browser);
    await votingTabButton.waitForExist();
    await votingTabButton.click();
    await browser["screenshot"]("voting-page");
  }, 10000);

  it("canShowAllProposals", async () => {
    const result = await browser.execute(() =>
      document.querySelectorAll('.filters button')
    );

    console.log(result);
  });
});
