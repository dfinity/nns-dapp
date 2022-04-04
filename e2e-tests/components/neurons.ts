import { execSync } from "child_process";

export const getNeuronsBody = async (browser: WebdriverIO.Browser) => {
  return await browser.$('[data-tid="neurons-body"]');
};

export const getStakingButton = async (browser: WebdriverIO.Browser) => {
  return await browser.$('[data-tid="stake-neuron-button"]');
};

export const createProposal = async (browser: WebdriverIO.Browser) => {
  // TODO: This is a placeholder until we can meake proposals via the browser.
  execSync(
    `ic-admin --nns-url "http://[2a00:fb01:400:42:5000:d1ff:fefe:987e]:8080" propose-to-update-subnet --subnet 2oiej-q2hjb-yig3c-e4lew-qagpu-4bkti-blslo-6sa3z-c6pws-nwigc-bae --test-neuron-proposer`
  );
};
