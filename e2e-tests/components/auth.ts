export const getLoginButton = async (browser: WebdriverIO.Browser) => {
  return await browser.$('[data-tid="login-button"]');
};

export const isAuthPage = async (browser: WebdriverIO.Browser) => {
  const loginButton = await getLoginButton(browser);
  return await loginButton.isExisting();
};
