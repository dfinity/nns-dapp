import { register } from "../common/register";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";

describe("landing page", () => {
  it("loads", async () => {
    await browser.url("/");

    await waitForLoad(browser);

    await browser.$("h1").waitForExist();

    await waitForImages(browser);

    await browser["screenshot"]("landing-page");
  });

  it("register and back to dashboard", async () => {
    await browser.url("/");

    await waitForLoad(browser);

    await browser.$("h1").waitForExist();

    await register(browser);

    // At this point it's still the login page
    // We wait for the header of the dashboard
    await browser.$("header").waitForExist({ timeout: 20_000 });
    const title = await browser.$("h1");
    const titleText = await title.getText();

    expect(titleText).toBe("Accounts");

    try {
      // remove spinner to make screenshots deterministic
      const spinner = await browser.$('[data-tid="spinner"]');
      await spinner.waitForExist();
      await browser.execute(() =>
        document.querySelector('[data-tid="spinner"]').remove()
      );
      await waitForImages(browser);
      // remove toast error to make screenshots deterministic
      const errorToast = await browser.$(".toast");
      await errorToast.waitForExist({ timeout: 10_000 });
      await browser.execute(() => document.querySelector(".toast").remove());
      await errorToast.waitUntil(() => !errorToast.isExisting());
    } catch (error) {
      // Log error, but continue and take screenshot
      console.log("Error waiting for spinner and toast error");
      console.log(error);
    } finally {
      await browser["screenshot"]("home-page");
    }
    // TODO: Deploy Ledger and Governance canisters and proxy them
    // How do we do this when they are in another repo? Do we have a repository of docker images?
    // TODO: Create docker image of NNS Dapp with IDENTITY_SERVICE_URL pointing to these proxies
  });
});
