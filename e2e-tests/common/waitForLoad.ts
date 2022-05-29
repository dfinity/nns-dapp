/**
 * Waits for a page to load.  Normally this is simple, but
 * we have a service worker that can load completely before
 * the actual page loads and we don't want that.
 */
export const waitForLoad = (
  browser: WebdriverIO.Browser
): Promise<true | void> => {
  // Check that the page has completely loaded, and we are not in the intermediate service worker bootstrap page:
  return browser.waitUntil(
    () =>
      browser.execute(() => {
        // We do not want the service worker bootstrap page, so:
        const serviceWorkerTitlePattern = /Content Validation Bootstrap/i;
        const isServiceWorkerBootstrapPage = !!document.title.match(
          serviceWorkerTitlePattern
        );
        // Check that the page has loaded and that it isn't the intermediate bootstrap page.
        return (
          document.readyState === "complete" && !isServiceWorkerBootstrapPage
        );
      }),
    { timeout: 60_000 }
  );
};
