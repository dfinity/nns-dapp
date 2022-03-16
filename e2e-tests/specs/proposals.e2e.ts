import { register } from '../common/register';
import { waitForLoad } from '../common/waitForLoad';

describe("proposals page", () => {
  // Skip tests unless running in testnet
  let itFn = process.env.NNS_DAPP_URL.includes('localhost') ? xit : it;

  itFn("register goes to the voting tab", async () => {
    await browser.url("/v2/");

    await waitForLoad(browser);

    await browser.$("h1").waitForExist();

    // Register in II
    await register(browser);

    // At this point it's still the login page
    // We wait for the header of the dashboard
    await browser.$('header').waitForExist({ timeout: 20_000 });

    // Go to Proposals
    await browser.url('/v2/#/proposals');

    // Wait for one proposals to be displayed
    await browser.$('[data-tid="card"]').waitForExist({ timeout: 20_000 });

    await browser["screenshot"]("proposals");
  });

  itFn("logs in and goes to one proposal details page", async () => {
    await browser.url("/v2/");

    await waitForLoad(browser);

    // We should be already logged in
    await browser.$('header').waitForExist({ timeout: 20_000 });

    // Go to Proposals
    await browser.url('/v2/#/proposals');

    // Wait for one proposals to be displayed
    await browser.$('[data-tid="card"]').waitForExist({ timeout: 20_000 });
    await browser.$('[data-tid="card"]').click();

    // Wait for the information card to be loaded
    await browser.$('[data-tid="card"]').waitForExist({ timeout: 20_000 });

    await browser["screenshot"]("proposal-detail");
  });
});