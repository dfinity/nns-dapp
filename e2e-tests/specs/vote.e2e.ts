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

  it("getIcp", async () => {
    const balanceField = await browser.$('[data-tid="card"] [data-tid="icp-value"]');
    await balanceField.waitForExist({timeout: 10000});
    const balance = Number(await balanceField.getText());
    if (balance < 2){
	    const getIcpButton = await browser.$('[data-tid="get-icp-button"]');
	    await getIcpButton.waitForExist();
	    await getIcpButton.click();
	    const numIcp = await browser.$('[data-tid="get-icp-form"] input');
	    await numIcp.waitForExist();
	    await numIcp.setValue("10");
	    const submitButton = await browser.$('[data-tid="get-icp-submit"]');
	    await submitButton.waitForExist();
	    await browser.pause(2000);
	    await browser["screenshot"]("get-icp-form");
	    await submitButton.click();
	    await browser.waitUntil(async () => !numIcp.isExisting(), {timeout: 10000});
    } else {
        console.log("Balance is already sufficient:", balance);
    }
  });

  /*
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
*/
});
