import { Navigator } from "../common/navigator";

export class Header extends Navigator {
  static readonly SELECTOR: string = "header";
  static readonly LOGOUT_BUTTON_SELECTOR: string = `${Header.SELECTOR} [data-tid="logout"]`;
  static readonly TAB_TO_ACCOUNTS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-accounts"]`;
  static readonly TAB_TO_NEURONS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-neurons"]`;
  static readonly TAB_TO_PROPOSALS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-proposals"]`;
  static readonly TAB_TO_CANISTERS_SELECTOR: string = `${Header.SELECTOR} [data-tid="tab-to-canisters"]`;
  static readonly GET_ICP_BUTTON: string = `${Header.SELECTOR} [data-tid="get-icp-button"]`
  static readonly GET_ICP_FORM: string = `${Header.SELECTOR} [data-tid="get-icp-form"]`
  static readonly GET_ICP_FORM_FIELD: string = `${Header.SELECTOR} [data-tid="get-icp-form"] [data-tid="input-ui-element"]`
  static readonly GET_ICP_FORM_BUTTON: string = `${Header.SELECTOR} [data-tid="get-icp-form"] [data-tid="get-icp-submit"]`

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }

  getIcp(howMuch: number) {
    await this.click(Header.GET_ICP_BUTTON, "Click the 'Get Icp' button");
    await await navigator.getElement(
    Header.GET_ICP_FORM_FIELD,
    "Get the field to enter how much ICP we want",
    { timeout: 30_000 }
    ).then(field => field.setValue(new String(howMuch)));
    await this.click(Header.GET_ICP_FORM_BUTTON, "Submit the request for ICP");
    await this.waitForGone( header.GET_ICP_FORM, "Wait for ICP" );
    await browser["screenshot"]("getIcpFinished");
  }
}
