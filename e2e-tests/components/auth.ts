export const getLoginButton = async (browser: WebdriverIO.Browser) => {
  return await browser.$("main button", { timeout: 10_000 });
};

export const isAuthPage = async (browser: WebdriverIO.Browser) => {
  const loginButton = await getLoginButton(browser);
  return await loginButton.isExisting();
};
