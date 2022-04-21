import { getLoginButton } from "../components/auth";
import { getLogoutButton } from "../components/header";
import { IIConfirmRedirectPage } from "../components/ii-confirm-redirect";
import { IIRecoveryMissingWarningPage } from "../components/ii-recovery-warning";
import { IIWelcomeBackPage } from "../components/ii-welcome-back-page";
import { IIWelcomePage } from "../components/ii-welcome-page";

export const loginWithIdentity = async (
  browser: WebdriverIO.Browser,
  identity: string
) => {
  console.info("Start login...");
  const loginButton = await getLoginButton(browser);
  await loginButton.waitForExist();

  // Check which windows already exist, then wait for a new window to appear.
  const originalTabId = await browser.getWindowHandle();
  await browser["screenshot"]("nns_dapp_login_page");
  await loginButton.click();
  await browser.pause(10_000);
  await browser.switchWindow("Internet Identity");

  browser.waitUntil(() =>
    browser.execute(() => document.readyState === "complete")
  );
  await browser["screenshot"]("ii_tab");

  console.info("Choose to log in with a different ID");
  const iiLoginButton = await browser.$(
    IIWelcomeBackPage.LOGIN_DIFFERENT_BUTTON_SELECTOR
  );
  if (await iiLoginButton.isExisting()) {
    //await browser["screenshot"]("ii_login_page");
    await iiLoginButton.click();
  }

  console.info("Enter the user ID:", identity);
  const iiUserIdField = await browser.$(IIWelcomePage.IDENTITY_FIELD_SELECTOR);
  await iiUserIdField.waitForExist();
  await iiUserIdField.setValue(identity);

  const iiLoginButton = await browser.$(IIWelcomePage.LOGIN_BUTTON_SLEECTOR);
  await iiLoginButton.waitForExist();
  //await browser["screenshot"]("ii_with_identity");
  await iiLoginButton.click();

  // The user MAY be prompted to add a recovery mechanism.
  const nextPage = await browser.$(
    `${IIRecoveryMissingWarningPage.SELECTOR}, ${IIConfirmRedirectPage.CONFIRM_REDIRECT_BUTTON_SELECTOR}`
  );
  await nextPage.waitForExist();
  if (await browser.$(IIRecoveryMissingWarningPage.SELECTOR).isExisting()) {
    console.info("Was warned that we have no recovery mechanism.  Skipping...");
    await IIRecoveryMissingWarningPage.skipAddingRecoveryMechanism(browser);
  }

  console.info("Confirming redirect...");
  const iiConfirmRedirect = await browser.$(
    IIConfirmRedirectPage.CONFIRM_REDIRECT_BUTTON_SELECTOR,
    {
      timeout: 20_000,
    }
  );
  await iiConfirmRedirect.waitForExist();
  //await browser["screenshot"]("ii_confirm_redirect");
  await iiConfirmRedirect.click();

  console.info("Returning to original tab...");
  await browser.switchToWindow(originalTabId);

  const logoutButton = await getLogoutButton(browser);
  await logoutButton.waitForExist({ timeout: 10_000 });
};
