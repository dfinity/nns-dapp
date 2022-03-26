export const getLogoutButton = async (browser: WebdriverIO.Browser) => {
   return await browser.$('[data-tid="logout-button"]');
};

export const getVotingTabButton = async (browser: WebdriverIO.Browser) => {
   return   	await browser.$('[data-tid="tab-proposals"]');
};
