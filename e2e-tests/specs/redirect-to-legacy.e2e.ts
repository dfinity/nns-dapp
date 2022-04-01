import { register } from "../common/register";
import { waitForLoad } from "../common/waitForLoad";

enum RouteHash {
  Accounts = "#/accounts",
  Neurons = "#/neurons",
  Proposals = "#/proposals",
  canisters = "#/canisters",
}


const NEURONS_HASH = "#/neurons";
const PROPOSALS_HASH = "#/proposals";
const CANISTERS_HASH = "#/canisters";

const FLUTTER_PATH="/";
const SVELTE_PATH="/v2/";

const REDIRECTS = {
    prod: { [RouteHash.Accounts]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, } },
    staging: { [RouteHash.Accounts]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, } },
    flutter: { [RouteHash.Accounts]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: FLUTTER_PATH, } },
    svelte: { [RouteHash.Accounts]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: SVELTE_PATH, [SVELTE_PATH]: SVELTE_PATH, } },
    both: { [RouteHash.Accounts]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [NEURONS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [PROPOSALS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, },
            [CANISTERS_HASH]: { [FLUTTER_PATH]: FLUTTER_PATH, [SVELTE_PATH]: SVELTE_PATH, } },
}[process.env.REDIRECT_TO_LEGACY || "prod"];

/**
 * Waits for the document hash to match the given value.
 *
 *  Note: The `wdio` `getUrl(..)` method does not detect all changes in the hash, so cannot be used.
 */
const waitForHash = async (browser: WebdriverIO.Browser, hash: string, options?: {timeout?: Number}) => {
    var currentHash = "";
    try {
      await browser.waitUntil(async () => {
        let currentLocation = await browser.execute(() => document.location);
        currentHash = currentLocation.hash;
        return hash === currentHash;
      }, options);
    } catch(err) {
      throw new Error(`Expected hash '${hash}' but have: '${currentHash}' with ${JSON.stringify(options)}`, { cause: err });
    }
};

/**
 * Waits for the complete path, including hash, to match the given value.
 *
 * Note: The `wdio` `getUrl(..)` method does not detect all changes in the hash, so cannot be used.
 */
const waitForPath = async (browser: WebdriverIO.Browser, path: string, options?: {timeout?: Number}) => {
    return browser.waitUntil(async () => await browser.execute((path) => `${document.location.pathname}${document.location.hash}` === path, path), options);
};

/**
 * Describes the redirect, if any, that should occur from a given path+hash.
 */
const redirectTestTitle = (fromPath: string, hash: string) => {
    const toPath = REDIRECTS[hash][fromPath];
    if (fromPath === toPath) {
       return `Remains on ${fromPath}${hash}`;
    } else {
       return `Redirects ${fromPath}${hash} -> ${toPath}${hash}`;
    }
};

/**
 * Tests the redirect, if any, that should occur from a given path+hash.
 */
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
    await waitForHash(browser, RouteHash.Accounts, {timeout: 10000});
  });

  [SVELTE_PATH, FLUTTER_PATH].forEach(path => {
    [
      RouteHash.Accounts,
      NEURONS_HASH,
      PROPOSALS_HASH,
      CANISTERS_HASH
    ].forEach(hash => {
      it(redirectTestTitle(path, hash), async () => {
        await redirectTest(browser, path, hash);
      });    
    });
  });
});
