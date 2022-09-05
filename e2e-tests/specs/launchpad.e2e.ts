import { MyNavigator } from "../common/navigator";
import { register } from "../common/register";
import { skipUnlessBrowserIs } from "../common/test";
import { Launchpad } from "../components/launchpad";
import { NAV_LAUNCHPAD_SELECTOR } from "../components/nav";

describe("Launchpad", () => {
  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome"]);
  });

  it("Setup: Register user", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.warn(`Created user: ${JSON.stringify(userId)}`);
  });

  it("Go to launchpad", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.navigate({
      selector: NAV_LAUNCHPAD_SELECTOR,
      description: "Go to the launchpad",
    });
  });

  it("Loading spinner should disappear", async () => {
    const launchpad = new Launchpad(browser);
    await launchpad.waitForGone(
      `[data-tid="spinner"]`,
      "Wait for spinner to disappear",
      {
        timeout: 30_000,
      }
    );
  });

  it("Should render Sns projects", async () => {
    const launchpad = new Launchpad(browser);

    const cardGridSelector = `div.split-pane main > div`;

    await launchpad.getElement(cardGridSelector, "Getting the card grid", {
      timeout: 30_000,
    })

    await browser.waitUntil(async () => {
      const elements = await browser.$$(`${cardGridSelector} article:not([data-tid="skeleton-card"])`);
      return elements.length > 0
    });
  });
});
