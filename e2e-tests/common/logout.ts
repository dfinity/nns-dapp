import { isAuthPage } from '../components/auth';
import { getLogoutButton } from '../components/header.ts';

export const logout = async (browser: WebdriverIO.Browser) => {
  const logoutButton = await getLogoutButton(browser);
  await logoutButton.waitForExist();
  await logoutButton.click();
  await browser.waitUntil(() => isAuthPage(browser));
};
