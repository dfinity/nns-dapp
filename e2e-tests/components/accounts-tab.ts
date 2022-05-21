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
    return this.getElement(
      `${AccountsTab.SELECTOR} [data-tid="account-card"] [data-account-name="${name}"]`,
      `Getting account '${name}'`,
      options
    );
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
    console.warn("We are indeed on the accounts tab");
    await this.click(
      AccountsTab.ADD_ACCOUNT_SELECTOR,
      "Start flow for adding an account"
    );
    console.warn("On Add Account..");
    // TODO: Verify that we get the "Add Account" modal.
    await this.click(
      AccountsTab.MAKE_ACCOUNT_LINKED_SELECTOR,
      "Choose the linked account flow"
    );
    // TODO: Verify that we get the "New Linked Account" modal.
    console.warn("On New Linked Account..");
    await this.browser.pause(1_000);
    await this.getElement(
      AccountsTab.LINKED_ACCOUNT_NAME_SELECTOR,
      "Get account name field"
    ).then((element) => element.setValue(linkedAccountName));
    await this.browser.pause(1_000);
    console.warn("click");
    await this.click(
      AccountsTab.CREATE_LINKED_ACCOUNT_BUTTON_SELECTOR,
      "Submit request to create new account"
    );
    console.warn("Submitted...");
    await this.getAccountByName(
      linkedAccountName,
      "Linked account appears in the account list",
      { timeout: 30_000 }
    );
    console.warn("Done");
  }
}
