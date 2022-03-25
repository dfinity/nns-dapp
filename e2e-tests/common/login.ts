import { getLoginButton } from '../components/auth';

export const loginWithIdentity = async (browser: WebdriverIO.Browser, identity: String) => {
  const loginButton = await getLoginButton(browser);
  await loginButton.waitForExist();

  // Check which windows already exist, then wait for a new window to appear.
  const originalTabId = await browser.getWindowHandle();
  const windowHandles = await browser.getWindowHandles();
  await loginButton.click();
  await browser.pause(5000);
  /*
  for (let i=0; i<10; i++) {
      await new Promise((yay) => setTimeout(yay, 100<<i));
      if ((await browser.getWindowHandles()).length > windowHandles.length) break;
  }
  */
  await browser.switchWindow('Internet Identity');

  const iiLoginButton = await browser.$('#loginDifferent');
  await iiLoginButton.waitForExist();
  await iiLoginButton.click();

  const iiUserIdField = await browser.$('#registerUserNumber');
  await iiUserIdField.waitForExist();
  await iiUserIdField.setValue(identity);

  const iiLoginButton = await browser.$('#loginButton');
  await iiLoginButton.waitForExist();
  await iiLoginButton.click();

  const iiConfirmRedirect = await browser.$('#confirmRedirect');
  await iiConfirmRedirect.waitForExist();
  await iiConfirmRedirect.click();

  await browser.switchToWindow(originalTabId);
}
