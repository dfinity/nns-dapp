/**
 * Additional functionality for the wdio "browser".
 */
export class Navigator {
  constructor(browser: WebdriverIO.Browser) {
    this.browser = browser;
  }

  /**
   * Gets an element, waiting for it to exist.
   * Motivation: Consistently useful error messages on timeout.
   */
  async getElement(
    selector: string,
    description: string,
    options?: { timeout?: number }
  ) {
    // Sadly typescript does not prevent undefined from being provided as a selector.
    if (undefined === selector) {
      throw new Error(`Cannot get undefined selector for "${description}".`);
    }
    const element = await this.browser.$(selector);
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting for "${description}" with selector "${selector}".`;
    await element.waitForExist({ timeout, timeoutMsg });
    return element;
  }

  /**
   * Gets any of a list of selectors.
   *
   * Returns a map with:
   * _: an element matching one of the selectors.
   * SELECTOR: an element matching SELECTOR, if found.
   *
   * Warning: Elements can disappear.
   */
  async getAny(
    selectors: Array<string>,
    description: string,
    options?: { timeout?: number }
  ) {
    // Comma is the OR operator in CSS query strings.
    let anyElement = await this.getElement(
      selectors.join(", "),
      description,
      options
    );
    return selectors.reduce(
      async (ans, selector) => {
        let element = await browser.$(selector);
        if (await element.isExisting()) {
          ans[selector] = element;
        }
        return ans;
      },
      { _: anyElement }
    );
  }

  /**
   * Clicks - the camera and then a navigation button.
   * Motivation: Taking a screenshot before each navigation gives an effective summary of an e2e test.
   */
  async click(
    selector: string,
    description: string,
    options?: { timeout?: number; screenshot?: boolean }
  ) {
    // Sadly typescript does not prevent undefined from being provided as a selector.
    if (undefined === selector) {
      throw new Error(`Cannot click undefined selector for "${description}".`);
    }
    const button = await this.browser.$(selector);
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting to click "${description}" with selector "${selector}".`;
    await button.waitForEnabled({ timeout, timeoutMsg });
    if (Boolean(process.env.SCREENSHOT) || (options?.screenshot ?? false)) {
      await browser["screenshot"](description);
    }
    await button.click();
  }

  /**
   * Clicks and moves to the newly opened window.
   * Warning: Navigation may be wrong-footed if multiple windows are opened or a window is opened and immediately closed.
   */
  async clickToOpenWindow(
    selector: string,
    description: string,
    options?: { timeout?: number }
  ) {
    if (undefined === selector) {
      throw new Error(`Cannot click undefined selector for "${description}".`);
    }
    const timeout = options?.timeout;
    const timeoutMsg = `Timed out waiting for window to open after clicking "${selector}" (${description}).`;
    const lengthBefore = (await this.browser.getWindowHandles()).length;
    await this.click(selector, description, { timeout });
    // Wait for a new tab to open, then switch to it.
    await browser.waitUntil(
      async () => (await browser.getWindowHandles()).length > lengthBefore,
      { timeout, timeoutMsg }
    );
    const newWindowHandle = await browser
      .getWindowHandles()
      .then((handles) => handles[handles.length - 1]);
    await browser.switchToWindow(newWindowHandle);
  }
}
