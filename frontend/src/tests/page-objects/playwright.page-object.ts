import type { PageObjectElement } from "$tests/types/page-object.types";
import { type Locator, type Page } from "@playwright/test";

export class PlaywrightPageObjectElement implements PageObjectElement {
  readonly locator: Locator;

  constructor(locator: Locator | Page) {
    this.locator = locator;
  }

  static fromPage(page: Page): PlaywrightPageObjectElement {
    return new PlaywrightPageObjectElement(page.locator("body"));
  }

  querySelector(selector: string): PlaywrightPageObjectElement {
    return new PlaywrightPageObjectElement(this.locator.locator(selector));
  }

  getText(): Promise<string> {
    return this.locator.textContent();
  }

  async isPresent(): Promise<boolean> {
    return (await this.locator.count()) > 0;
  }

  click(): Promise<void> {
    return this.locator.click();
  }
}
