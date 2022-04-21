import { getLoginButton } from "../components/auth";
import { getLogoutButton } from "../components/header";
import { IIConfirmRedirectPage } from "../components/ii-confirm-redirect";
import { IIRecoveryMissingWarningPage } from "../components/ii-recovery-warning";
import { IIRecoveryMechanismPage } from "../components/ii-recovery-mechanism";
import { IIWelcomeBackPage } from "../components/ii-welcome-back-page";
import { IIWelcomePage } from "../components/ii-welcome-page";
import { Header } from "../components/header";
import { Navigator } from "./navigator";
import { AuthPage } from "../components/auth";

/**
 * Logs in with an existing identity anchor.
 */
export const loginWithIdentity = async (
  browser: WebdriverIO.Browser,
  identity: string
) => {
  const log = console.info;
  log("Logging in as user", identity);
  if (undefined === browser) {
    throw new Error("Browser is undefined in 'loginWithIdentity(..)'");
  }
  const navigator = new Navigator(browser);

  // Record the ID of the tab we started on.
  const originalTabId = await browser.getWindowHandle();

  // On the NNS frontend dapp, click "Login".
  // Wait for a new tab to open, then switch to it.
  await navigator.clickToOpenWindow(
    AuthPage.LOGIN_BUTTON_SELECTOR,
    "nns-login-page",
    { timeout: 10_000 }
  );

  // We should now be on the Internet Identity page.
  // We may get to the "Welcome" or the "Welcome back" page.  If we get "Welcome back"
  // then we need to navigate to the normal welcome page to log in with the specified ID.
  // ... wait for either welcome page
  let matches = await navigator.getAny([IIWelcomeBackPage.LOGIN_DIFFERENT_BUTTON_SELECTOR, IIWelcomePage.REGISTER_BUTTON_SELECTOR], "welcome-or-welcome-back", { timeout: 30_000 });
  // ... is this the welcome back page?
  if (IIWelcomeBackPage.LOGIN_DIFFERENT_BUTTON_SELECTOR in matches) {
    // ... go to the normal welcome page.
    await browser["screenshot"]("login-ii-welcome-back");
    await matches[IIWelcomeBackPage.LOGIN_DIFFERENT_BUTTON_SELECTOR].click();
  }
  // We should now be on the normal welcome page, regardless of how we got here.

  log("Entering the user ID:", identity);
  const iiUserIdField = await browser.$(IIWelcomePage.IDENTITY_FIELD_SELECTOR);
  await iiUserIdField.waitForExist();
  await iiUserIdField.setValue(identity);

  navigator.click(
    IIWelcomePage.LOGIN_BUTTON_SELECTOR,
    "identity anchor form submission"
  );

  // The user MAY be:
  // - prompted to add a recovery mechanism or
  // - warned about recovery mechanisms - a page that is almost identical, or
  // - taken to the confirmation page.
  // We look for all.  If we get a recovery page we skip on to the confirmation page.
  await Promise.race([
    navigator.click(IIRecoveryMechanismPage.SKIP_RECOVERY_BUTTON_SELECTOR, "skip recovery offer"),
    navigator.click(IIRecoveryMissingWarningPage.SKIP_BUTTON_SELECTOR, "skip recovery warning"),
    navigator.getElement(IIConfirmRedirectPage.CONFIRM_REDIRECT_BUTTON_SELECTOR, "on the confirmation page already")
  ]);

  // Now we should be arriving at the confirmation page, by one of several possible paths.
  log("Confirming redirect...");
  await navigator.click(
    IIConfirmRedirectPage.CONFIRM_REDIRECT_BUTTON_SELECTOR,
    "ii confirm redirect",
    { timeout: 20_000 }
  );

  log("Returning to original tab...");
  await browser.switchToWindow(originalTabId);
  await navigator.getElement(
    Header.LOGOUT_BUTTON_SELECTOR,
    "Wait for login with existing anchor",
    { timeout: 10_000 }
  );
};
