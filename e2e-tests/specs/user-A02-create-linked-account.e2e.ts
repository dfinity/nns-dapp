/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { AccountsTab } from "../components/accounts-tab";
import { Capabilities } from "@wdio/types";

/**
 * Verifies that users can create a linked account
 */
describe("Users get a main account", () => {
  const linkedAccountName = "Koala";

  before(function () {
    const compatibleBrowsers = ["chrome"];
    if (
      !compatibleBrowsers.includes(
        (browser.capabilities as Capabilities.Capabilities).browserName ??
          "unknown"
      )
    )
      this.skip();
  });

  it("Setup: Create a new user", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.log(`Created user: ${JSON.stringify(userId)}`);
  });

  it("Setup: We should be on the accounts tab", async () => {
    // Verify that we are on the accounts tab.
    const navigator = new MyNavigator(browser);
    await navigator.getElement(
      AccountsTab.SELECTOR,
      "Wait for the accounts tab"
    );
  });

  it(`User should be able to create a linked account '${linkedAccountName}'`, async () => {
    await browser.setWindowSize(800, 1000);
    await new AccountsTab(browser).createLinkedAccount(linkedAccountName);
  });

  it(`User should have the linked account '${linkedAccountName}'`, async () => {
    // Note: getAccountByName() returns a promise.  If the main
    // account cannot be found within a reasaonable amount
    // of time, the promise will fail and the await will
    // fail the test.
    await new AccountsTab(browser).getAccountByName(
      linkedAccountName,
      "Checking that the linked account exists"
    );
  });

  it(`The linked account '${linkedAccountName}' should still be present after refresh`, async () => {
    await browser.refresh();

    // Note: getAccountByName() returns a promise.  If the main
    // account cannot be found within a reasaonable amount
    // of time, the promise will fail and the await will
    // fail the test.
    await new AccountsTab(browser).getAccountByName(
      linkedAccountName,
      "Checking that the linked account exists after refresh"
    );
  });
});
