import { register } from '../common/register';
import { logout } from '../common/logout';
import { loginWithIdentity } from '../common/login';
import { waitForImages } from '../common/waitForImages';
import { waitForLoad } from '../common/waitForLoad';

describe("landing page", () => {
  const nns_tabs = [];

  it("openTwoTabs", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    console.log(await browser.getTitle());
    await browser["screenshot"]("tab-one");

    nns_tabs.push(await browser.getWindowHandle());
    await browser.newWindow("/");
    await waitForLoad(browser);
    console.log(await browser.getTitle());
    await browser["screenshot"]("tab-two");
    nns_tabs.push(await browser.getWindowHandle());
    console.log(JSON.stringify({nns_tabs}));
  });

  it("loginTabOne", async () => {
    await loginWithIdentity(browser, "10000");
    await waitForImages(browser);
  });

  it("allTabsLogIn", async () => {
    nns_tabs.forEach(async (tabId) => {
      await browser.switchToWindow(tabId);
      let logoutButton = await getLogoutButton(browser);
      await logoutButton.waitForExist({ timeout: 10000 });
    });
  });
});
