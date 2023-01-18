import { register } from "../common/register";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";
import { skipUnlessBrowserIs } from "../common/test";

describe("View launchpad while logged out", () => {
  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome", "firefox"]);
  });

  it("Views the launchpad whil elogged out", async () => {
    await browser.url("/launchpad/");
    await waitForLoad(browser);
    await waitForImages(browser);
    await browser.pause(2000); // Wait a second for the back-end data to load
    await browser["screenshot"]("launchpad-while-logged-out");
  });
});

describe("View launchpad when logged in", () => {
  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome"]);
  });
  it("Registers and logs in as a user", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.log(`Created user: ${JSON.stringify(userId)}`);
    await waitForLoad(browser);
    await waitForImages(browser);
    await browser.pause(2000); // Wait a second for the back-end data to load
    await browser["screenshot"]("launchpad-login");
  });

  it("Views the launchpad while logged in", async () => {
    await browser.url("/launchpad/");
    await waitForLoad(browser);
    await waitForImages(browser);
    await browser.pause(2000); // Wait a second for the back-end data to load
    await browser["screenshot"]("launchpad-while-logged-in");
  });
});
