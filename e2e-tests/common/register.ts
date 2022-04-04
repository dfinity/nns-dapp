export const register = async (browser: WebdriverIO.Browser) => {
  await browser.$("main button").waitForExist();
  await browser.$("main button").click();

  // REGISTRATION

  // Internet Identity
  // First title is from the Service Worker.
  await browser.pause(5000);
  // We want to switch the tab to II.
  await browser.switchWindow("Internet Identity");
  const registerButton = await browser.$("#registerButton");
  await registerButton.waitForExist({ timeout: 10_000 });
  await registerButton.click();

  // Add Device Page
  const registerAlias = await browser.$("#registerAlias");
  await registerAlias.waitForExist();
  await registerAlias.setValue("My Device");

  await browser.$('button[type="submit"]').click();

  // Captcha Page
  const captchaInput = await browser.$("#captchaInput");
  await captchaInput.waitForExist({ timeout: 30_000 });
  await captchaInput.setValue("a");
  await browser.waitUntil(async () => {
    return (await captchaInput.getValue()) === "a";
  });

  const confirmCaptchaButton = await browser.$("#confirmRegisterButton");
  // Long wait: Construction Your Identity Anchor
  await confirmCaptchaButton.waitForEnabled({ timeout: 30_000 });
  await confirmCaptchaButton.click();

  // Congratulations Page
  const continueButton = await browser.$("#displayUserContinue");
  await continueButton.waitForExist({ timeout: 30_000 });
  await continueButton.click();

  // Recovery Mechanism Page
  const addLaterButton = await browser.$("#skipRecovery");
  await addLaterButton.waitForExist();
  await addLaterButton.click();

  // Warning Recovery Mechanism Page
  const skipButton = await browser.$("#displayWarningRemindLater");
  await skipButton.waitForExist();
  await skipButton.click();

  // Confirm Redirect Page
  const proceedButton = await browser.$("#confirmRedirect");
  await proceedButton.waitForExist();
  await proceedButton.click();

  await browser.switchWindow("Network Nervous System frontend dapp");
};
