const { register } = require("../common/register");
const { waitForLoad } = require("../common/waitForLoad");
const {
  RouteHash,
  FrontendPath,
  RedirectToLegacy,
  REDIRECT_TO_LEGACY,
} = require("../common/constants");

const REDIRECTS = {
  [RedirectToLegacy.prod]: {
    [RouteHash.Accounts]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
    [RouteHash.Neurons]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
    [RouteHash.Proposals]: {
      [FrontendPath.Flutter]: FrontendPath.Svelte,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Canisters]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
  },
  [RedirectToLegacy.staging]: {
    [RouteHash.Accounts]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
    [RouteHash.Neurons]: {
      [FrontendPath.Flutter]: FrontendPath.Svelte,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Proposals]: {
      [FrontendPath.Flutter]: FrontendPath.Svelte,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Canisters]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
  },
  [RedirectToLegacy.flutter]: {
    [RouteHash.Accounts]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
    [RouteHash.Neurons]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
    [RouteHash.Proposals]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
    [RouteHash.Canisters]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Flutter,
    },
  },
  [RedirectToLegacy.svelte]: {
    [RouteHash.Accounts]: {
      [FrontendPath.Flutter]: FrontendPath.Svelte,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Neurons]: {
      [FrontendPath.Flutter]: FrontendPath.Svelte,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Proposals]: {
      [FrontendPath.Flutter]: FrontendPath.Svelte,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Canisters]: {
      [FrontendPath.Flutter]: FrontendPath.Svelte,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
  },
  [RedirectToLegacy.both]: {
    [RouteHash.Accounts]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Neurons]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Proposals]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
    [RouteHash.Canisters]: {
      [FrontendPath.Flutter]: FrontendPath.Flutter,
      [FrontendPath.Svelte]: FrontendPath.Svelte,
    },
  },
}[REDIRECT_TO_LEGACY];

/**
 * Waits for the document hash to match the given value.
 *
 *  Note: The `wdio` `getUrl(..)` method does not detect all changes in the hash, so cannot be used.
 */
const waitForHash = async (
  browser: WebdriverIO.Browser,
  hash: string,
  options?: { timeout?: number }
) => {
  let currentHash = "";
  try {
    await browser.waitUntil(async () => {
      const currentLocation = await browser.execute(() => document.location);
      currentHash = currentLocation.hash;
      return hash === currentHash;
    }, options);
  } catch (err) {
    throw new Error(
      `Expected hash '${hash}' but have: '${currentHash}' with ${JSON.stringify(
        options
      )}`,
      { cause: err }
    );
  }
};

/**
 * Waits for the complete path, including hash, to match the given value.
 *
 * Note: The `wdio` `getUrl(..)` method does not detect all changes in the hash, so cannot be used.
 */
const waitForPath = async (
  browser: WebdriverIO.Browser,
  path: string,
  options?: { timeout?: number }
) => {
  const { timeout } = options;
  let currentPath = "";
  try {
    await browser.waitUntil(async () => {
      const currentLocation = await browser.execute(() => document.location);
      currentPath = `${currentLocation.pathname}${currentLocation.hash}`;
      return currentPath === path;
    }, options);
  } catch (err) {
    throw new Error(
      `Expected path '${path}' but have: '${currentPath}' with ${JSON.stringify(
        options
      )}`,
      { cause: err }
    );
  }
};

/**
 * Describes the redirect, if any, that should occur from a given path+hash.
 */
const redirectTestTitle = (fromPath: FrontendPath, hash: RouteHash) => {
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
const redirectTest = async (
  browser: WebdriverIO.Browser,
  fromPath: FrontendPath,
  hash: RouteHash
) => {
  const toPath = REDIRECTS[hash][fromPath];
  await browser.url(`${fromPath}${hash}`);
  await waitForPath(browser, `${toPath}${hash}`, { timeout: 20_000 });
  if (fromPath === toPath) {
    // Check that we stay on this page.
    await browser.pause(2_000);
    const path = await browser.execute(
      () => `${document.location.pathname}${document.location.hash}`
    );
    expect(path).toBe(`${toPath}${hash}`);
  }
};

describe("redirects", () => {
  it("goes to accounts page after registration", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await register(browser);
    await waitForHash(browser, RouteHash.Accounts, { timeout: 10_000 });
  });

  Object.values(FrontendPath).forEach((path) => {
    Object.values(RouteHash).forEach((hash) => {
      it(redirectTestTitle(path, hash), async () => {
        await redirectTest(browser, path, hash);
      });
    });
  });
});
