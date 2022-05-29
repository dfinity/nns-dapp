import { MyNavigator } from "../common/navigator";

export class Header extends MyNavigator {
  static readonly SELECTOR: string = "header";
  static readonly NAVIGATION_BAR_SELECTOR: string = "nav";
  static readonly LOGOUT_BUTTON_SELECTOR: string = `${Header.SELECTOR} [data-tid="logout"]`;
  static readonly TAB_TO_ACCOUNTS_SELECTOR: string = `${Header.NAVIGATION_BAR_SELECTOR} [data-tid="tab-to-accounts"]`;
  static readonly TAB_TO_NEURONS_SELECTOR: string = `${Header.NAVIGATION_BAR_SELECTOR} [data-tid="tab-to-neurons"]`;
  static readonly TAB_TO_PROPOSALS_SELECTOR: string = `${Header.NAVIGATION_BAR_SELECTOR} [data-tid="tab-to-proposals"]`;
  static readonly TAB_TO_CANISTERS_SELECTOR: string = `${Header.NAVIGATION_BAR_SELECTOR} [data-tid="tab-to-canisters"]`;
  static readonly GET_ICP_BUTTON: string = `${Header.SELECTOR} [data-tid="get-icp-button"]`;
  static readonly GET_ICP_FORM: string = `${Header.SELECTOR} [data-tid="get-icp-form"]`;
  static readonly GET_ICP_FORM_FIELD: string = `${Header.SELECTOR} [data-tid="get-icp-form"] [data-tid="input-ui-element"]`;
  static readonly GET_ICP_FORM_BUTTON: string = `${Header.SELECTOR} [data-tid="get-icp-form"] [data-tid="get-icp-submit"]`;

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }

  async getIcp(howMuch: number): Promise<void> {
    // WARNING: If we start before the accounts have loaded this fails.  Why?  No idea.
    // Waiting later does not help, it seems as if the wait has to be before we open the getIcp modal.
    // TODO: The getICP button should not be clickable until it works.
    await this.browser.pause(6000);
    // Ok, now the accounts should have loaded.

    // The rest is straightforward:
    await this.click(Header.GET_ICP_BUTTON, "Click the 'Get Icp' button");
    await this.getElement(
      Header.GET_ICP_FORM_FIELD,
      "Get the field to enter how much ICP we want",
      { timeout: 30_000 }
    ).then((element) => element.setValue(howMuch.toString()));
    await this.click(Header.GET_ICP_FORM_BUTTON, "Click 'submit'");
    await this.waitForGone(Header.GET_ICP_FORM, "Wait for ICP", {
      timeout: 10000,
    });
  }
}
