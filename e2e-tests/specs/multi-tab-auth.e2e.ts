import { register } from "../common/register";
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
    await browser["screenshot"]("register-tab-one");
  });

  it("allTabsLogIn", async () => {
    await Promise.all(
      nnsTabs.map(async (tabId, index) => {
        await browser.switchToWindow(tabId);
        await browser.refresh();
        await navigator.getElement(
          Header.ACCOUNT_MENU_BUTTON_SELECTOR,
          "Account menu button"
        );
        await browser["screenshot"](`register-logged-in-tab-${index}`);
      })
    );
  });

  it("oneTabLogsOut", async () => {
    await browser.switchToWindow(nnsTabs[0]);
    await navigator.click(
      Header.ACCOUNT_MENU_BUTTON_SELECTOR,
      "Account menu button"
    );

    // Small delay for menu animation
    await browser.pause(500);

    await navigator.click(Header.LOGOUT_BUTTON_SELECTOR, "logout");

    // Wait for the logout to complete
    await browser.pause(2_000);
    await navigator.getElement(AuthPage.LOGIN_BUTTON_SELECTOR, "Login page");
  });

  it("allTabsLogOut", async () => {
    nnsTabs.forEach(async (tabId) => {
      await browser.switchToWindow(tabId);
      await navigator.getElement(AuthPage.LOGIN_BUTTON_SELECTOR);
    });
  });
});
