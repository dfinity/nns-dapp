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

  querySelectorCount({
    selector,
    count,
  }: {
    selector: string;
    count: number;
  }): PlaywrightPageObjectElement[] {
    const elements: PlaywrightPageObjectElement[] = [];
    for (let i = 0; i < count; i++) {
      elements.push(
        new PlaywrightPageObjectElement(this.locator.locator(selector).nth(i))
      );
    }
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
    count,
  }: {
    tid: string;
    count: number;
  }): PlaywrightPageObjectElement[] {
    return this.querySelectorCount({
      selector: `[data-tid=${tid}]`,
      count,
    });
  }

  getValue(): Promise<string> {
    throw new Error("Not implement");
  }

  getText(): Promise<string> {
    return this.locator.textContent();
  }

  getAttribute(_attribute: string): Promise<string | null> {
    throw new Error("Not implement");
  }

  getClasses(): Promise<string[] | null> {
    throw new Error("Not implement");
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
