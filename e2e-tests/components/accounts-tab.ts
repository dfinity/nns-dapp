import { MyNavigator } from "../common/navigator";

export class AccountsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="accounts-body"]`; // This should be used to verify that we are on the accounts tab.

  /**
   * Gets an account by account title.
   */
  async getAccountByName(
    name: string,
    description: string,
    options?: { timeout?: number }
  ) {
    const element = await this.browser
      .$(`//*[@data-tid = 'account-card' and .//*[@slot = "start" and ./h3[text()] = '${name.replaceAll("'", "\\'")}']]`);
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting for "${description}" with account "${name}".`;
    await element.waitForExist({ timeout, timeoutMsg });
    return element;
  }

  /**
   * Gets the ICP from an account card.
   */
  static async getAccountCardIcp(element: WebdriverIO.Element): Promise<number> {
    const timeoutMsg = `Could not get value from element: ${await element.getHTML(true)}`;
    const icpField = element.$(`[data-tid="icp-value"]`);
    await icpField.waitForExist({timeoutMsg});
    const icpValue = await icpField.getText();
    const icpNumber = Number(icpValue);
    if (Number.isFinite(icpValue)) {
      throw new Error(timeoutMsg);
    }
    return icpNumber;
  }

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }
}
