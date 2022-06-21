import { MENU_CLOSE_SELECTOR, MENU_SELECTOR } from "../components/nav";

/**
 * Additional functionality for the wdio "browser".
 */
export class MyNavigator {
  browser: WebdriverIO.Browser;

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
  ): Promise<WebdriverIO.Element> {
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
   * Clicks - the camera and then a navigation button.
   * Motivation: Taking a screenshot before each navigation gives an effective summary of an e2e test.
   */
  async click(
    selector: string,
    description: string,
    options?: { timeout?: number; screenshot?: boolean }
  ): Promise<void> {
    // Sadly typescript does not prevent undefined from being provided as a selector.
    if (undefined === selector) {
      throw new Error(`Cannot click undefined selector for "${description}".`);
    }
    await this.browser.pause(100);
    const button = await this.browser.$(selector);
    const timeout = options?.timeout ?? 50_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting to click "${description}" with selector "${selector}".`;
    await button.waitForEnabled({ timeout, timeoutMsg });
    await button.scrollIntoView();
    await button.waitForClickable({ timeout, timeoutMsg });
    if (Boolean(process.env.SCREENSHOT) || (options?.screenshot ?? false)) {
      console.log("taking screenshot");
      await this.browser["screenshot"](description);
      await this.browser.takeScreenshot();
    }
    await button.click();
  }

  async openMenu(): Promise<void> {
    await this.click(MENU_SELECTOR, "Open the menu");

    // Small delay for menu animation
    await this.browser.pause(500);
  }

  async closeMenu(): Promise<void> {
    await this.click(MENU_CLOSE_SELECTOR, "Close the menu");

    // Small delay for menu animation
    await this.browser.pause(500);
  }

  async navigate({
    selector,
    description,
  }: {
    selector: string;
    description: string;
  }): Promise<void> {
    await this.openMenu();

    await this.click(selector, description);
  }

  /**
   * Clicks and moves to the newly opened window.
   * Warning: Navigation may be wrong-footed if multiple windows are opened or a window is opened and immediately closed.
   */
  async clickToOpenWindow(
    selector: string,
    description: string,
    options?: { timeout?: number }
  ): Promise<void> {
    if (undefined === selector) {
      throw new Error(`Cannot click undefined selector for "${description}".`);
    }
    const timeout = options?.timeout;
    const timeoutMsg = `Timed out waiting for window to open after clicking "${selector}" (${description}).`;
    const lengthBefore = (await this.browser.getWindowHandles()).length;
    await this.click(selector, description, { timeout });
    // Wait for a new tab to open, then switch to it.
    await this.browser.waitUntil(
      async () => (await this.browser.getWindowHandles()).length > lengthBefore,
      { timeout, timeoutMsg }
    );
    const newWindowHandle = await this.browser
      .getWindowHandles()
      .then((handles) => handles[handles.length - 1]);
    await this.browser.switchToWindow(newWindowHandle);
  }

  /**
   * Waits for an element to be removed from the DOM.
   */
  async waitForGone(
    selector: string,
    description: string,
    options?: { timeout?: number }
  ): Promise<void> {
    if (undefined === selector) {
      throw new Error(
        `Cannot wait for undefined selector to be removed for "${description}".`
      );
    }
    const element = await this.browser.$(selector);
    const timeout = options?.timeout;
    const timeoutMsg = `Timed out waiting for element to disappear: "${selector}" (${description}).`;
    await this.browser.waitUntil(async () => !(await element.isExisting()), {
      timeout,
      timeoutMsg,
    });
  }
}
