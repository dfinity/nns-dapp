import { MyNavigator } from "../common/navigator";

export class AccountsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="accounts-body"]`; // This should be used to verify that we are on the accounts tab.

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }

  /**
   * Gets an account by account title.
   */
  async getAccountByName(
    name: string,
    description: string,
    options?: { timeout?: number }
  ): Promise<WebdriverIO.Element> {
    const element = await this.browser
      .$(`${AccountsTab.SELECTOR} [data-tid="account-card"]`)
      .$(`.title=${name}`);
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting for "${description}" with account "${name}"i.`;
    await element.waitForExist({ timeout, timeoutMsg });
    return element;
  }
}
