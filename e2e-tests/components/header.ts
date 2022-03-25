export const getLogoutButton = async (browser: WebdriverIO.Browser) => {
   return await browser.$('[data-tid="logout-button"]');
};
