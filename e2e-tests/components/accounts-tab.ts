import { MyNavigator } from "../common/navigator";

export class AccountsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="accounts-body"]`; // This should be used to verify that we are on the accounts tab.
  static readonly ADD_ACCOUNT_SELECTOR: string = `[data-tid="open-add-account-modal"]`;
  static readonly MAKE_ACCOUNT_LINKED_SELECTOR: string = `[data-tid="choose-linked-as-account-type"]`;
  static readonly MAKE_ACCOUNT_HARDWARE_SELECTOR: string = `[data-tid="choose-hardware-wallet-as-account-type"]`;
  static readonly LINKED_ACCOUNT_NAME_SELECTOR: string = `#modalContent [data-tid="input-ui-element"]`;
  static readonly CREATE_LINKED_ACCOUNT_BUTTON_SELECTOR: string = `#modalContent [type="submit"]`;

  /**
   * Creates a browser controller for the accounts tab.
   */
  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }

  async getAccountByName(
    name: string,
    description: string,
    options?: { timeout?: number }
  ): Promise<WebdriverIO.Element> {
    const accountNameWithEscapedSingleQuotes = name.replace(/'/g, "\\'");
    const element = await this.browser.$(
      `//*[@data-tid = 'account-card' and .//*[@data-tid="account-name" and text() = '${accountNameWithEscapedSingleQuotes}']]`
    );
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting for "${description}" with account "${name}".`;
    await element.waitForExist({ timeout, timeoutMsg });
    return element;
  }

  /**
   * Creates a linked account.
   */
  async createLinkedAccount(linkedAccountName: string): Promise<void> {
    await this.browser.pause(6_000);
    await this.getElement(
      AccountsTab.SELECTOR,
      "Prerequisite: Verify that we are on the acconts tab"
    );
    await this.click(
      AccountsTab.ADD_ACCOUNT_SELECTOR,
      "Start flow for adding an account"
    );
    await this.click(
      AccountsTab.MAKE_ACCOUNT_LINKED_SELECTOR,
      "Choose the linked account flow"
    );
    await this.browser.pause(1_000);
    await this.getElement(
      AccountsTab.LINKED_ACCOUNT_NAME_SELECTOR,
      "Get account name field"
    ).then((element) => element.setValue(linkedAccountName));
    await this.browser.pause(1_000);
    await this.click(
      AccountsTab.CREATE_LINKED_ACCOUNT_BUTTON_SELECTOR,
      "Submit request to create new account"
    );
    await this.getAccountByName(
      linkedAccountName,
      "Linked account appears in the account list",
      { timeout: 30_000 }
    );
    console.warn(`Created account '${linkedAccountName}'`);
  }
}
