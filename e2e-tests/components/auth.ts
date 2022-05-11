export class AuthPage {
  // Selector used to verify that a page is the login page.
  static readonly SELECTOR: string = 'main[data-tid="auth-page"]';
  static readonly LOGIN_BUTTON_SELECTOR: string = `${AuthPage.SELECTOR} [data-tid="login-button"]`;
}
