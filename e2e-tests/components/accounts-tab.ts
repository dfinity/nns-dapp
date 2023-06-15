import { MyNavigator } from "../common/navigator";

export class AccountsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="accounts-body"]`; // This should be used to verify that we are on the accounts tab.
  static readonly ADD_ACCOUNT_SELECTOR: string = `[data-tid="open-add-account-modal"]`;
  static readonly MAKE_ACCOUNT_LINKED_SELECTOR: string = `[data-tid="choose-linked-as-account-type"]`;
  static readonly MAKE_ACCOUNT_HARDWARE_SELECTOR: string = `[data-tid="choose-hardware-wallet-as-account-type"]`;
  static readonly LINKED_ACCOUNT_NAME_SELECTOR: string = `[id*="modal-content-"] [data-tid="input-ui-element"]`;
  static readonly CREATE_LINKED_ACCOUNT_BUTTON_SELECTOR: string = `[id*="modal-content-"] [type="submit"]`;
  static readonly ICP_VALUE_SELECTOR: string = `[data-tid="token-value"]`;
  static readonly DESTINATION_TOGGLE_SELECTOR: string = `[data-tid="select-destination"] [for="toggle"]`;

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
   * Gets the ICP from an account card.
   */
  static async getAccountCardIcp(
    element: WebdriverIO.Element
  ): Promise<number> {
    const timeoutMsg = `Could not get value from element: ${await element.getHTML(
      true
    )}`;
    const icpField = element.$(AccountsTab.ICP_VALUE_SELECTOR);
    await icpField.waitForExist({ timeoutMsg, timeout: 30_000 });
    const icpValue = await icpField.getText();
    const icpNumber = Number(icpValue);
    if (!Number.isFinite(icpNumber)) {
      throw new Error(`${timeoutMsg} (Invalid number '${icpNumber}')`);
    }
    return icpNumber;
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

  /**
   * Sends ICP from one account to another named account.
   */
  async sendIcpToAccountName({
    sender,
    // TODO: Select recipient with xpath by recipient name
    /* eslint-disable-next-line */
    recipient,
    icp,
  }: {
    sender: string;
    recipient: string;
    icp: number;
  }): Promise<void> {
    await this.getElement(
      AccountsTab.SELECTOR,
      "Waiting to be on the accounts tab"
    );
    const senderElement = await this.getAccountByName(
      sender,
      "Sender's account in accounts tab"
    );
    await senderElement.waitForEnabled({
      timeout: 1_000,
      timeoutMsg: "Waiting for the source account to be selectable",
    });
    senderElement.click();
    await this.click(
      `[data-tid="new-transaction"]`,
      "Click to start new transaction"
    );
    // Enter amount
    const valueElement = await this.getElement(
      `[data-tid="input-ui-element"][id="amount"]`,
      "ICP input field"
    );
    await valueElement.waitForEnabled({
      timeout: 1_000,
      timeoutMsg: "Waiting to be able to enter value to be transferred",
    });
    await valueElement.setValue(icp);
    // Click toggle to select destination dropdown
    await this.click(
      AccountsTab.DESTINATION_TOGGLE_SELECTOR,
      "Click destination toggle"
    );

    // TODO: Select recipient with xpath by recipient name
    // At the moment it will select the first subaccount available

    // Move to Review
    await this.click(
      '[data-tid="transaction-button-next"]',
      "Click to move to review"
    );

    // Execute transaction
    await this.click(
      '[data-tid="transaction-button-execute"]',
      "Click to execute transaction"
    );

    await this.waitForGone(`div.modal`, "Wait for modal to disappear", {
      timeout: 30_000,
    });
    await this.click(`button.back`, "Return to the accounts page");
  }
}
