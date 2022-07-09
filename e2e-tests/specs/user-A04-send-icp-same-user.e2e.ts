/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { AccountsTab } from "../components/accounts-tab";
import { Icp } from "../components/icp";

/**
 * Verifies that new users get a main account.
 */
describe("Users can send ICP between accounts", () => {
  const mainAccountName = "Main";
  const linkedAccountName = "Grizly";
  let mainAccountValueBefore = NaN; // Value is filled in during the test.
  let linkedAccountValueBefore = NaN; // Value is filled in during the test.
  const transferIcp = 0.7;

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

  it("Setup: Get ICP", async () => {
    await new Icp(browser).getIcp(10);
  });

  it(`Setup: Create a linked account '${linkedAccountName}'`, async () => {
    await new AccountsTab(browser).createLinkedAccount(linkedAccountName);
  });

  it(`Send ICP from main account to linked account by name`, async () => {
    const accountsTab = new AccountsTab(browser);
    mainAccountValueBefore = await AccountsTab.getAccountCardIcp(
      await accountsTab.getAccountByName(
        mainAccountName,
        "Get main account to check balance before"
      )
    );
    linkedAccountValueBefore = await AccountsTab.getAccountCardIcp(
      await accountsTab.getAccountByName(
        linkedAccountName,
        "Get linked account to check balance before"
      )
    );
    await accountsTab.sendIcpToAccountName({
      sender: mainAccountName,
      recipient: linkedAccountName,
      icp: transferIcp,
    });
  });
  it(`Account balances are correct`, async () => {
    const accountsTab = new AccountsTab(browser);
    const mainAccountValueAfter = await AccountsTab.getAccountCardIcp(
      await accountsTab.getAccountByName(
        mainAccountName,
        "Get main account to check balance after"
      )
    );
    const linkedAccountValueAfter = await AccountsTab.getAccountCardIcp(
      await accountsTab.getAccountByName(
        linkedAccountName,
        "Ger linked account to check balance after"
      )
    );
    expect(linkedAccountValueAfter).toBe(
      linkedAccountValueBefore + transferIcp
    );
    const fee = mainAccountValueBefore - transferIcp - mainAccountValueAfter;
    const expectedMaxFee = 0.0001001; // Small allowance for javascript imprecision.
    if (fee < 0 || fee > expectedMaxFee) {
      throw new Error(`Unexpected fee: ${fee}`);
    }
  });
});
