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

    await browser
      .$('[data-tid="accounts-summary"]')
      .waitForExist({ timeout: 30_000 });

    await waitForImages(browser);
    await browser["screenshot"]("home-page");
  });
});
