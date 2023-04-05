import type { PageObjectElement } from "$tests/types/page-object.types";
import { expect, type Locator, type Page } from "@playwright/test";

export class PlaywrightPageObjectElement implements PageObjectElement {
  readonly locator: Locator;

  constructor(locator: Locator | Page) {
    this.locator = locator;
  }

  static fromPage(page: Page): PlaywrightPageObjectElement {
    return new PlaywrightPageObjectElement(page.locator("body"));
  }

  querySelector(selector: string): PlaywrightPageObjectElement {
    return new PlaywrightPageObjectElement(
      this.locator.locator(selector).first()
    );
  }

  async querySelectorAll(
    selector: string
  ): Promise<PlaywrightPageObjectElement[]> {
    return (await this.locator.locator(selector).all()).map(
      (locator) => new PlaywrightPageObjectElement(locator)
    );
  }

  async querySelectorCount({
    selector,
    expectedCount,
  }: {
    selector: string;
    expectedCount: number;
  }): Promise<PlaywrightPageObjectElement[]> {
    await expect(this.locator.locator(selector)).toHaveCount(expectedCount);
    const elements = await this.querySelectorAll(selector);
    expect(elements).toHaveLength(expectedCount);
    return elements;
  }

  byTestId(tid: string): PlaywrightPageObjectElement {
    return this.querySelector(`[data-tid=${tid}]`);
  }

  allByTestId(tid: string): Promise<PlaywrightPageObjectElement[]> {
    return this.querySelectorAll(`[data-tid=${tid}]`);
  }

  countByTestId({
    tid,
    expectedCount,
  }: {
    tid: string;
    expectedCount: number;
  }): Promise<PlaywrightPageObjectElement[]> {
    return this.querySelectorCount({
      selector: `[data-tid=${tid}]`,
      expectedCount,
    });
  }

  getText(): Promise<string> {
    return this.locator.textContent();
  }

  async isPresent(): Promise<boolean> {
    return (await this.locator.count()) > 0;
  }

  waitFor(): Promise<void> {
    return this.locator.waitFor();
  }

  waitForAbsent(): Promise<void> {
    return expect(this.locator).toHaveCount(0);
  }

  click(): Promise<void> {
    return this.locator.click();
  }

  typeText(text: string): Promise<void> {
    return this.locator.type(text);
  }

  selectOption(text: string): Promise<void> {
    return this.locator.selectOption(text);
  }
}
