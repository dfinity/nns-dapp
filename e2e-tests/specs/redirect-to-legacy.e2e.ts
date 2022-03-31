import { register } from "../common/register";
import { waitForImages } from "../common/waitForImages";
import { waitForLoad } from "../common/waitForLoad";

const ACCOUNTS_HASH = "#/accounts";
const NEURONS_HASH = "#/neurons";
const PROPOSALS_HASH = "#/proposals";
const CANISTERS_HASH = "#/canisters";

const FLUTTER_PATH="/";
const SVELTE_PATH="/v2/";

const REDIRECTS = {
    prod: { [ACCOUNTS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, } },
    staging: { [ACCOUNTS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, } },
    flutter: { [ACCOUNTS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, } },
    svelte: { [ACCOUNTS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, } },
    both: { [ACCOUNTS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, } },
}[process.env.REDIRECT_TO_LEGACY || "prod"];

/**
 * Wait for the document hash to match the given value.
 *
 *  Note: The `wdio` `getUrl(..)` method does not detect all changes in the hash, so cannot be used.
 */
const waitForHash = async (browser: WebdriverIO.Browser, hash: string, options?: {timeout?: Number}) => {
    var currentHash = "";
    try {
      await browser.waitUntil(async () => {
        let currentLocation = await browser.execute((hash) => document.location);
        currentHash = currentLocation.hash;
        return hash === currentHash;
      }, options);
    } catch(err) {
      throw new Error(`Expected hash '${hash}' but have: '${currentHash}' with ${JSON.stringify(options)}`, { cause: err });
    }
};

/**
 * Wait for the complete path, including hash, to match the given value.
 *
 * Note: The `wdio` `getUrl(..)` method does not detect all changes in the hash, so cannot be used.
 */
const waitForPath = async (browser: WebdriverIO.Browser, path: string, options?: {timeout?: Number}) => {
    return browser.waitUntil(async () => await browser.execute((path) => `${document.location.pathname}${document.location.hash}` === path, path), options);
};


const redirectTestTitle = (fromPath: string, hash: string) => {
    const toPath = REDIRECTS[hash][fromPath];
    if (fromPath === toPath) {
       return `Remains on ${fromPath}${hash}`;
    } else {
       return `Redirects ${fromPath}${hash} -> ${toPath}${hash}`;
    }
};

const redirectTest = async (browser: WebdriverIO.Browser, fromPath, hash) => {
    const toPath = REDIRECTS[hash][fromPath];
    await browser.url(`${fromPath}${hash}`);
    await waitForPath(browser, `${toPath}${hash}`, {timeout: 10000});
    if (fromPath === toPath) {
        // Check that we stay on this page.
        await browser.pause(2000);
        const path = await browser.execute(() => `${document.location.pathname}${document.location.hash}`);
        expect(path).toBe(`${toPath}${hash}`);
    }
};

describe("redirects", () => {
  it("goes to accounts page after registration", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await register(browser);
    await waitForHash(browser, ACCOUNTS_HASH, {timeout: 10000});
  });

  it(redirectTestTitle(SVELTE_PATH, ACCOUNTS_HASH), async () => {
    await redirectTest(browser, SVELTE_PATH, ACCOUNTS_HASH);
  });
  it(redirectTestTitle(SVELTE_PATH, NEURONS_HASH), async () => {
    await redirectTest(browser, SVELTE_PATH, NEURONS_HASH);
  });
  it(redirectTestTitle(SVELTE_PATH, PROPOSALS_HASH), async () => {
    await redirectTest(browser, SVELTE_PATH, PROPOSALS_HASH);
  });
  it(redirectTestTitle(SVELTE_PATH, CANISTERS_HASH), async () => {
    await redirectTest(browser, SVELTE_PATH, CANISTERS_HASH);
  });
  it(redirectTestTitle(FLUTTER_PATH, ACCOUNTS_HASH), async () => {
    await redirectTest(browser, FLUTTER_PATH, ACCOUNTS_HASH);
  });
  it(redirectTestTitle(FLUTTER_PATH, NEURONS_HASH), async () => {
    await redirectTest(browser, FLUTTER_PATH, NEURONS_HASH);
  });
  it(redirectTestTitle(FLUTTER_PATH, PROPOSALS_HASH), async () => {
    await redirectTest(browser, FLUTTER_PATH, PROPOSALS_HASH);
  });
  it(redirectTestTitle(FLUTTER_PATH, CANISTERS_HASH), async () => {
    await redirectTest(browser, FLUTTER_PATH, CANISTERS_HASH);
  });
});
