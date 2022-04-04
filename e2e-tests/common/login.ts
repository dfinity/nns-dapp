import { getLoginButton } from "../components/auth";
import { getLogoutButton } from "../components/header.ts";

export const loginWithIdentity = async (
  browser: WebdriverIO.Browser,
  identity: string
) => {
  const loginButton = await getLoginButton(browser);
  await loginButton.waitForExist();

  // Check which windows already exist, then wait for a new window to appear.
  const originalTabId = await browser.getWindowHandle();
  // const windowHandles = await browser.getWindowHandles();
  await loginButton.click();
  await browser.pause(5000);
  /*
  for (let i=0; i<10; i++) {
      await new Promise((yay) => setTimeout(yay, 100<<i));
      if ((await browser.getWindowHandles()).length > windowHandles.length) break;
  }
  */
  await browser.switchWindow("Internet Identity");

  browser.waitUntil(() =>
    browser.execute(() => document.readyState === "complete")
  );
  await browser["screenshot"]("ii_tab");

  const iiLoginButton = await browser.$("#loginDifferent");
  if (await iiLoginButton.isExisting()) {
    //await browser["screenshot"]("ii_login_page");
    await iiLoginButton.click();
  }

  const iiUserIdField = await browser.$("#registerUserNumber");
  await iiUserIdField.waitForExist();
  await iiUserIdField.setValue(identity);

  const iiLoginButton = await browser.$("#loginButton");
  await iiLoginButton.waitForExist();
  //await browser["screenshot"]("ii_with_identity");
  await iiLoginButton.click();

  const iiConfirmRedirect = await browser.$("#confirmRedirect");
  await iiConfirmRedirect.waitForExist();
  //await browser["screenshot"]("ii_confirm_redirect");
  await iiConfirmRedirect.click();

  await browser.switchToWindow(originalTabId);

  const logoutButton = await getLogoutButton(browser);
  await logoutButton.waitForExist({ timeout: 10000 });
};
