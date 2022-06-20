import { MyNavigator } from "../common/navigator";

const GET_ICP_BUTTON: string = `[data-tid="get-icp-button"]`;
const GET_ICP_FORM: string = `[data-tid="get-icp-form"]`;
const GET_ICP_FORM_FIELD: string = `[data-tid="get-icp-form"] [data-tid="input-ui-element"]`;
const GET_ICP_FORM_BUTTON: string = `[data-tid="get-icp-form"] [data-tid="get-icp-submit"]`;

export class Icp extends MyNavigator {
  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }

  async getIcp(howMuch: number): Promise<void> {
    // WARNING: If we start before the accounts have loaded this fails.  Why?  No idea.
    // Waiting later does not help, it seems as if the wait has to be before we open the getIcp modal.
    // TODO: The getICP button should not be clickable until it works.
    await this.browser.pause(6000);
    // Ok, now the accounts should have loaded.

    await this.openMenu();

    // The rest is straightforward:
    await this.click(GET_ICP_BUTTON, "Click the 'Get Icp' button");

    const element: WebdriverIO.Element = await this.getElement(
      GET_ICP_FORM_FIELD,
      "Get the field to enter how much ICP we want",
      { timeout: 30_000 }
    );
    element.setValue(howMuch.toString());

    await this.click(GET_ICP_FORM_BUTTON, "Click 'submit'");
    await this.waitForGone(GET_ICP_FORM, "Wait for ICP", {
      timeout: 10000,
    });

    await this.closeMenu();
  }
}
