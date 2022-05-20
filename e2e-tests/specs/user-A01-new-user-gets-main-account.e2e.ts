/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { AccountsTab } from "../components/accounts-tab";

describe("Makes Standard Users", () => {
  /**
   * Creates a user with:
   * - ICP in the main account
   * - A neuron
   */
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
