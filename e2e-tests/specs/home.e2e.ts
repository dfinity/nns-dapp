import { register } from "../common/register";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";
import { skipUnlessBrowserIs } from "../common/test";

describe("landing page", () => {
  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome", "firefox"]);
  });

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

    await waitForImages(browser);
    await browser["screenshot"]("home-page");
    // TODO: Deploy Ledger and Governance canisters and proxy them
    // How do we do this when they are in another repo? Do we have a repository of docker images?
    // TODO: Create docker image of NNS Dapp with IDENTITY_SERVICE_URL pointing to these proxies
  });
});
