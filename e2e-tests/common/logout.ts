import { isAuthPage } from '../components/lib/auth';

export const logout = async (browser: WebdriverIO.Browser) => {
  const logoutButton = await browser.$('[data-tid="logout-button"]'); // TODO: replace with data-tid=logout-button
  await logoutButton.waitForExist();
  await logoutButton.click();
  await browser.waitUntil(() => isAuthPage(browser));
};
