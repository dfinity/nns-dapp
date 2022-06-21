import { MyNavigator } from "../common/navigator";

export class Header extends MyNavigator {
  static readonly SELECTOR: string = "header";
  static readonly ACCOUNT_MENU_BUTTON_SELECTOR: string = `${Header.SELECTOR} [data-tid="account-menu"]`;
  static readonly LOGOUT_BUTTON_SELECTOR: string = `${Header.SELECTOR} [data-tid="logout"]`;

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }
}
