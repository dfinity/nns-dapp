import { register } from "../common/register";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";
import { skipUnlessBrowserIs } from "../common/test";

const LAUNCHPAD_PATHS = ["/launchpad", "/launchpad/"];

describe("View launchpad while logged out", () => {
  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome", "firefox"]);
  });

  LAUNCHPAD_PATHS.forEach((path, index) =>
    it(`Views ${path} while logged out`, async () => {
      await browser.url(path);
      await waitForLoad(browser);
      await waitForImages(browser);
      await browser.$("//h4[text()='Launch Pad']").waitForExist();
      await browser.pause(2000); // Wait for content.  Placeholder for real content tests.
      await browser["screenshot"](`launchpad-v${index}-while-logged-out`);
    })
  );
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
    await browser.pause(2000); // Wait for content.  Placeholder for real content tests.
    await browser["screenshot"]("launchpad-login");
  });

  LAUNCHPAD_PATHS.forEach((path, index) =>
    it(`Views ${path} while logged in`, async () => {
      await browser.url(path);
      await waitForLoad(browser);
      await waitForImages(browser);
      await browser.$("//h4[text()='Launch Pad']").waitForExist();
      await browser.pause(2000); // Wait for content.  Placeholder for real content tests.
      await browser["screenshot"](`launchpad-v${index}-while-logged-in`);
    })
  );
});
