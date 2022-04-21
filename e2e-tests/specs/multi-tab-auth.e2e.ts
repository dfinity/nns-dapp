import { register } from "../common/register";
import { loginWithIdentity } from "../common/login";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";
import { Header } from "../components/header.ts";
import { getLoginButton } from "../components/auth";
import { Navigator } from "../common/navigator";
import { AuthPage } from "../components/auth";

/**
 * Verifies that the login/logout state is synchronised across tabs.
 */
describe("multi-tab-auth", () => {
  const nnsTabs = [];
  var identityAnchor = undefined;
  var navigator;

  before(() => {
    navigator = new Navigator(browser);
  });

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
    await waitForImages(browser);
    await browser["screenshot"]("register-tab-one");
  });

  it("allTabsLogIn", async () => {
    await Promise.all(
      nnsTabs.map(async (tabId, index) => {
        await browser.switchToWindow(tabId);
        await navigator.getElement(Header.LOGOUT_BUTTON_SELECTOR);
        await browser["screenshot"](`register-logged-in-tab-${index}`);
      })
    );
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
});
