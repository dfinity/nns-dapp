import { AuthPage } from "../components/auth";
import { IIWelcomeBackPage } from "../components/ii-welcome-back-page";
import { IIWelcomePage } from "../components/ii-welcome-page";
import { IIWelcomePage } from "../components/ii-add-device-page";
import { IICaptchaPage } from "../components/ii-captcha-page";
import { IICongratulationsPage } from "../components/ii-congratulations-page";
import { IIRecoveryMechanismPage } from "../components/ii-recovery-mechanism";
import { IIRecoveryMissingWarningPage } from "../components/ii-recovery-warning";
import { IIConfirmRedirectPage } from "../components/ii-confirm-redirect";
import { IIAddDevicePage } from "../components/ii-add-device-page";

export const register = async (browser: WebdriverIO.Browser) => {
  // Record the ID of the tab we started on.
  const originalTabId = await browser.getWindowHandle();
  const lengthBefore = (await browser.getWindowHandles()).length;

  // On the NNS frontend dapp, click "Login".
  await browser["screenshot"]("registration-nns-login-page");
  const loginButton = await browser.$(AuthPage.LOGIN_BUTTON_SELECTOR);
  await loginButton.waitForExist();
  await loginButton.click();

  // REGISTRATION
  // Wait for a new tab to open, then switch to it.
  await browser.waitUntil(
    async () => (await browser.getWindowHandles()).length > lengthBefore,
    { timeoutMsg: "Timed out waiting for II window to open.", timeout: 10_000 }
  );
  const newWindowHandle = await browser
    .getWindowHandles()
    .then((handles) => handles[handles.length - 1]);
  await browser.switchToWindow(newWindowHandle);

  // We may get to the "Welcome back" page.  If so, use "loginDifferent" to get to the normal login page.
  (
    await browser.$(
      `${IIWelcomeBackPage.LOGIN_DIFFERENT_BUTTON_SELECTOR}, ${IIWelcomePage.REGISTER_BUTTON_SELECTOR}`
    )
  ).waitForExist({ timeout: 30_000 });
  const loginDifferent = browser.$(
    IIWelcomeBackPage.LOGIN_DIFFERENT_BUTTON_SELECTOR
  );
  if (await loginDifferent.isExisting()) {
    await browser["screenshot"]("registration-ii-welcome-back");
    await loginDifferent.click();
  }

  // Click the button to register.
  const registerButton = await browser.$(
    IIWelcomePage.REGISTER_BUTTON_SELECTOR
  );
  await registerButton.waitForExist({ timeout: 20_000 });
  await browser["screenshot"]("registration-ii-welcome-page");
  await registerButton.click();

  // Add Device Page
  const registerAlias = await browser.$(
    IIAddDevicePage.REGISTER_ALIAS_INPUT_SELECTOR
  );
  await registerAlias.waitForExist();
  await registerAlias.setValue("My Device");

  await browser.$(IIAddDevicePage.SUBMIT_BUTTON_SELECTOR).click();

  // Captcha Page
  const captchaInput = await browser.$(IICaptchaPage.CAPTCHA_INPUT_SELECTOR);
  await captchaInput.waitForExist({ timeout: 30_000 });
  await captchaInput.setValue("a");
  await browser.waitUntil(async () => {
    return (await captchaInput.getValue()) === "a";
  });

  const confirmCaptchaButton = await browser.$(
    IICaptchaPage.CONFIRM_REGISTER_BUTTON
  );
  // Long wait: Construction Your Identity Anchor
  await confirmCaptchaButton.waitForEnabled({ timeout: 30_000 });
  await confirmCaptchaButton.click();

  // Congratulations Page
  const continueButton = await browser.$(
    IICongratulationsPage.CONTINUE_BUTTON_SELECTOR
  );
  await continueButton.waitForExist({ timeout: 30_000 });
  await continueButton.click();

  // Recovery Mechanism Page
  const addLaterButton = await browser.$(
    IIRecoveryMechanismPage.SKIP_RECOVERY_BUTTON_SELECTOR
  );
  await addLaterButton.waitForExist();
  await addLaterButton.click();

  // Warning Recovery Mechanism Page
  const skipButton = await browser.$(
    IIRecoveryMissingWarningPage.SKIP_BUTTON_SELECTOR
  );
  await skipButton.waitForExist();
  await skipButton.click();

  // Confirm Redirect Page
  const proceedButton = await browser.$(
    IIConfirmRedirectPage.CONFIRM_REDIRECT_BUTTON_SELECTOR
  );
  await proceedButton.waitForExist();
  await proceedButton.click();

  // Switch back to original window
  await browser.switchToWindow(originalTabId);
};
