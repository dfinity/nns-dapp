export const getLoginButton = async (browser: WebdriverIO.Browser) => {
  return await browser.$('[data-tid="login-button"]');
};

export const isAuthPage = async (browser: WebdriverIO.Browser) => {
  let loginButton = await getLoginButton(browser);
  return await loginButton.isExisting();
};
