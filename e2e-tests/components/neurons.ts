export const getNeuronsBody = async (browser: WebdriverIO.Browser) => {
   return await browser.$('[data-tid="neurons-body"]');
};

export const getStakingButton = async (browser: WebdriverIO.Browser) => {
   return   	await browser.$('[data-tid="stake-neuron-button"]');
};
