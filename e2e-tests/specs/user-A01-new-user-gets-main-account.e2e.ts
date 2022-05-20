/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { AccountsTab } from "../components/accounts-tab";

/**
 * Veifies that new users get a main account.
 */
describe("Users get a main account", () => {
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

  it("User should have a main account", async () => {
    await new AccountsTab(browser).getAccountByName(
      "Main",
      "Checking that the main account exists"
    );
  });
});
