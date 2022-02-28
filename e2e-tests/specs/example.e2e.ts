/**
 * Waits for a page to load.  Normally this is simple, but
 * we have a service worker that can load completely before
 * the actual page loads and we don't want that.
 */
function waitForLoad(browser) {
  // Check that the page has completely loaded, and we are not in the intermediate service worker bootstrap page:
  return browser.waitUntil(() => browser.execute(() => {
    // We do not want the service worker bootstrap page, so:
    const serviceWorkerTitlePattern = /Content Validation Bootstrap/i;
    const isServiceWorkerBootstrapPage = !!document.title.match(serviceWorkerTitlePattern);
    // Check that the page has loaded and that it isn't the intermediate bootstrap page.
    return (document.readyState === 'complete') && !isServiceWorkerBootstrapPage;
  }), {timeout: 60_000});
}

describe("landing page", () => {
  it("loads", async () => {
    await browser.url("/v2/");

    await waitForLoad(browser);

    await browser.$("h1").waitForExist();

    // Wait for all images to be "complete", i.e. loaded
    browser.waitUntil(
      function () {
        return this.execute(function () {
          const imgs: HTMLCollectionOf<HTMLImageElement> =
            document.getElementsByTagName("img");
          if (imgs.length <= 0) {
            return true;
          }

          return (
            Array.prototype.every.call(imgs, (img) => {
              return img.complete;
            }) && document.readyState === "complete"
          );
        });
      },
      { timeoutMsg: "image wasn't loaded" }
    );

    await browser["screenshot"]("landing-page");
  });

  // DO NOT RUN ON CI PIPELINE
  // TODO: Enable for CI Pipeline
  xit("register and back to dashboard", async () => {
    await browser.url("/v2/");

    await browser.$("h1").waitForExist();

    // Click Login Button
    await browser.$("button").click();

    // REGISTRATION
  
    // Internet Identity
    // TODO: Deploy II canisters to localhost and proxy them.
    // How do we do this when they are in another repo? Do we have a repository of docker images?
    // TODO: Create docker image of NNS Dapp with IDENTITY_SERVICE_URL pointing to II proxy
    // https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/#authorize
    const iiURL = "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/#authorize"
    await browser.switchWindow(iiURL);
    const registerButton = await browser.$("#registerButton");
    await registerButton.waitForExist({ timeout: 10_000 });
    await registerButton.click();

    // Add Device Page
    const registerAlias = await browser.$("#registerAlias");
    await registerAlias.waitForExist();
    await registerAlias.setValue("My Device");

    await browser.$("button[type=\"submit\"]").click();

    // Captcha Page
    const captchaInput = await browser.$("#captchaInput");
    await captchaInput.waitForExist({ timeout: 30_000 });
    await captchaInput.setValue("a");
    await browser.waitUntil(async () => {
      return (await captchaInput.getValue()) === "a";
    });

    const confirmCaptchaButton = await browser.$("#confirmRegisterButton");
    // Long wait: Construction Your Identity Anchor
    await confirmCaptchaButton.waitForEnabled({ timeout: 30_000 });
    await confirmCaptchaButton.click();

    // Congratulations Page
    const continueButton = await browser.$("#displayUserContinue");
    await continueButton.waitForExist({ timeout: 10_000 });
    await continueButton.click();

    // Recovery Mechanism Page
    const addLaterButton = await browser.$("#skipRecovery");
    await addLaterButton.waitForExist();
    await addLaterButton.click();

    // Warning Recovery Mechanism Page
    const skipButton = await browser.$("#displayWarningRemindLater");
    await skipButton.waitForExist();
    await skipButton.click();
    
    // Confirm Redirect Page
    const proceedButton = await browser.$("#confirmRedirect");
    await proceedButton.waitForExist();
    await proceedButton.click();

    await browser.switchWindow("Network Nervous System");
    
    await browser.$("h1").waitForExist();
    const title = await browser.$("h1");

    
    await browser.waitUntil(
      async () => {
        return (await title.getText()) === "Accounts";
      },
      { timeout: 20_000 }
    );
    
    await browser["screenshot"]("home-page");
    // TODO: Deploy Ledger and Governance canisters and proxy them
    // How do we do this when they are in another repo? Do we have a repository of docker images?
    // TODO: Create docker image of NNS Dapp with IDENTITY_SERVICE_URL pointing to these proxies
  });
});
