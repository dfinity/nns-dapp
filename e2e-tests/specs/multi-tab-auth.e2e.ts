import { register } from "../common/register";
import { logout } from "../common/logout";
import { loginWithIdentity } from "../common/login";
import { getLoginButton } from "../components/auth";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";
import { getLogoutButton } from "../components/header.ts";

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
    console.log(JSON.stringify({ nns_tabs }));
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

  it("oneTabLogsOut", async () => {
    const logoutButton = await getLogoutButton(browser);
    await logoutButton.waitForExist();
    await logoutButton.click();
    const loginButton = await getLoginButton(browser);
    await loginButton.waitForExist();
  });

  it("allTabsLogOut", async () => {
    nns_tabs.forEach(async (tabId) => {
      await browser.switchToWindow(tabId);
      let loginButton = await getLoginButton(browser);
      await loginButton.waitForExist({ timeout: 10000 });
    });
  });
});
