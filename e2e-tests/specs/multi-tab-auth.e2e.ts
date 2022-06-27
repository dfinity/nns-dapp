import { register } from "../common/register";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";
import { Header } from "../components/header";
import { MyNavigator } from "../common/navigator";
import { AuthPage } from "../components/auth";
import { skipUnlessBrowserIs } from "../common/test";

/**
 * Verifies that the login/logout state is synchronised across tabs.
 */
describe("multi-tab-auth", () => {
  const nnsTabs: Array<string> = [];
  let navigator;

  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome"]);
    navigator = new MyNavigator(browser);
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
    await register(browser);
    await waitForImages(browser);
    await browser["screenshot"]("register-tab-one");
  });

  it("allTabsLogIn", async () => {
    await Promise.all(
      nnsTabs.map(async (tabId, index) => {
        await browser.switchToWindow(tabId);
        await navigator.getElement(Header.ACCOUNT_MENU_BUTTON_SELECTOR);
        await browser["screenshot"](`register-logged-in-tab-${index}`);
      })
    );
  });

  it("oneTabLogsOut", async () => {
    await browser.switchToWindow(nnsTabs[0]);
    await navigator.click(Header.ACCOUNT_MENU_BUTTON_SELECTOR, "account-menu");

    // Small delay for menu animation
    await browser.pause(500);

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
