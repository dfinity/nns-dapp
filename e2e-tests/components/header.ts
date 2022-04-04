export const getLogoutButton = async (browser: WebdriverIO.Browser) => {
  return await browser.$('[data-tid="logout-button"]');
};

export const getNeuronTabButton = async (browser: WebdriverIO.Browser) => {
  return await browser.$('[data-tid="tab-to-neurons"]');
};
export const getVotingTabButton = async (browser: WebdriverIO.Browser) => {
  return await browser.$('[data-tid="tab-to-proposals"]');
};
