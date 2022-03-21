import { register } from '../common/register';
import { waitForLoad } from '../common/waitForLoad';

describe("landing page", () => {
  it("loads", async () => {
    await browser.url("/");

    await waitForLoad(browser);

    await browser.$("h1").waitForExist();

    // Wait for all images to be "complete", i.e. loaded
    browser.waitUntil(
      function () {
        return this.execute(function () {
          const imgs: HTMLCollectionOf<HTMLImageElement> =
            document.getElementsByTagName("img");
          if (imgs.length <= 0) {
            return true;
          }

          return (
            Array.prototype.every.call(imgs, (img) => {
              return img.complete;
            }) && document.readyState === "complete"
          );
        });
      },
      { timeoutMsg: "image wasn't loaded" }
    );

    await browser["screenshot"]("landing-page");
  });

  it("register and back to dashboard", async () => {
    await browser.url("/");

    await waitForLoad(browser);

    await browser.$("h1").waitForExist();

    await register(browser);

    // At this point it's still the login page
    // We wait for the header of the dashboard
    await browser.$('header').waitForExist({ timeout: 20_000 });
    const title = await browser.$("h1");
    const titleText = await title.getText();

    expect(titleText).toBe("Accounts");

    // remove spinner to make screenshots deterministic
    const spinner = await browser.$('main section svg');
    await spinner.waitForExist();
    await browser.execute(() => document.querySelector('main section svg').remove());

    await browser["screenshot"]("home-page");
    // TODO: Deploy Ledger and Governance canisters and proxy them
    // How do we do this when they are in another repo? Do we have a repository of docker images?
    // TODO: Create docker image of NNS Dapp with IDENTITY_SERVICE_URL pointing to these proxies
  });
});
