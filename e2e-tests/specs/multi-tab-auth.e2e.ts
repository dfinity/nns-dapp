import { register } from "../common/register";
import { loginWithIdentity } from "../common/login";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";
import { Header } from "../components/header.ts";
import { getLoginButton } from "../components/auth";
import { Navigator } from "../common/navigator";

/**
 * Verifies that the login/logout state is synchronised across tabs.
 */
describe("multi-tab-auth", () => {
  const navigator = new Navigator(browser);
  const nnsTabs = [];
  var identityAnchor = undefined;

  it("openTwoTabs", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await browser["screenshot"]("tab-one");

    nnsTabs.push(await browser.getWindowHandle());
    await browser.newWindow("/");
    await waitForLoad(browser);
    await browser["screenshot"]("tab-two");
    nnsTabs.push(await browser.getWindowHandle());
  });

  it("registerTabOne", async () => {
    identityAnchor = await register(browser);
    await navigator.getElement(Header.LOGOUT_BUTTON_SELECTOR);
    await waitForImages(browser);
    await browser["screenshot"]("register-tab-one");
  });

  it("allTabsLogIn", async () => {
    await Promise.all(nnsTabs.map(async (tabId, index) => {
      await browser.switchToWindow(tabId);
      await navigator.getElement(Header.LOGOUT_BUTTON_SELECTOR);
      await browser["screenshot"](`register-logged-in-tab-${index}`);
    }));
  });

  it("oneTabLogsOut", async () => {
    await browser.switchToWindow(nnsTabs[0]);
    await navigator.click(Header.LOGOUT_BUTTON_SELECTOR, "logout");
    await navigator.getElement(AuthPage.SELECTOR);
  });

  it("allTabsLogOut", async () => {
    nnsTabs.forEach(async (tabId) => {
      await browser.switchToWindow(tabId);
      await navigator.getElement(AuthPage.SELECTOR);
    });
  });

  // Now with login rather than registration:
  it("loginTabOne", async () => {
    if (identityAnchor === undefined) {
        throw new Error(`Registration failed to provide an identity anchor.`);
    }
    await loginWithIdentity(browser, identityAnchor);
    await waitForImages(browser);
  });

  it("allTabsLogInAgain", async () => {
    nnsTabs.forEach(async (tabId) => {
      await browser.switchToWindow(tabId);
      const logoutButton = await getLogoutButton(browser);
      await logoutButton.waitForExist({ timeout: 10000 });
    });
  });

  it("oneTabLogsOutAgain", async () => {
    const logoutButton = await getLogoutButton(browser);
    await logoutButton.waitForExist();
    await logoutButton.click();
    const loginButton = await getLoginButton(browser);
    await loginButton.waitForExist();
  });

  it("allTabsLogOutAgain", async () => {
    nnsTabs.forEach(async (tabId) => {
      await browser.switchToWindow(tabId);
      const loginButton = await getLoginButton(browser);
      await loginButton.waitForExist({ timeout: 10000 });
    });
  });
});
