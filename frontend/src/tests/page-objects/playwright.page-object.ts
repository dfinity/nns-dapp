import type { PageObjectElement } from "$tests/types/page-object.types";
import type { Locator, Page } from "@playwright/test";

export class PlaywrightPageObjectElement implements PageObjectElement {
  readonly locator: Locator;

  constructor(locator: Locator) {
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
    return this.querySelector(`[data-tid="${tid}"]`);
  }

  allByTestId(tid: string): Promise<PlaywrightPageObjectElement[]> {
    return this.querySelectorAll(`[data-tid="${tid}"]`);
  }

  countByTestId({
    tid,
    count,
  }: {
    tid: string;
    count: number;
  }): PlaywrightPageObjectElement[] {
    return this.querySelectorCount({
      selector: `[data-tid="${tid}"]`,
      count,
    });
  }

  getValue(): Promise<string> {
    throw new Error("Not implement");
  }

  getText(): Promise<string> {
    return this.locator.textContent();
  }

  getAttribute(attribute: string): Promise<string | null> {
    return this.locator.getAttribute(attribute);
  }

  async getClasses(): Promise<string[] | null> {
    const classNames = await this.getAttribute("class");
    return classNames?.split(" ");
  }

  isChecked(): Promise<boolean> {
    return this.locator.isChecked();
  }

  async isPresent(): Promise<boolean> {
    return (await this.locator.count()) > 0;
  }

  waitFor(): Promise<void> {
    /**
     * `locator.waitFor` defaults to `'visible'`. Can be either:
     * - `'attached'` - wait for element to be present in DOM.
     * - `'detached'` - wait for element to not be present in DOM.
     * - `'visible'` - wait for element to have non-empty bounding box and no `visibility:hidden`. Note that element
     *   without any content or with `display:none` has an empty bounding box and is not considered visible.
     * - `'hidden'` - wait for element to be either detached from DOM, or have an empty bounding box or
     *   `visibility:hidden`. This is opposite to the `'visible'` option.
     *
     * We use `"attached"` which is the same functionality as Jest `waitFor` counterpart.
     */
    return this.locator.waitFor({ state: "attached" });
  }

  waitForAbsent(): Promise<void> {
    return this.locator.waitFor({ state: "detached" });
  }

  click(): Promise<void> {
    return this.locator.click();
  }

  input(_value: string): Promise<void> {
    throw new Error("Not implement");
  }

  typeText(text: string): Promise<void> {
    return this.locator.fill(text);
  }

  async selectOption(text: string): Promise<void> {
    await this.locator.selectOption(text);
  }

  async isVisible(): Promise<boolean> {
    throw new Error("Not implement");
  }

  async blur(): Promise<void> {
    throw new Error("Not implement");
  }

  async innerHtmlForDebugging(): Promise<string> {
    return "not implemeneted";
  }

  async addEventListener(): Promise<void> {
    throw new Error("Not implement");
  }

  async getDocumentBody(): Promise<PlaywrightPageObjectElement> {
    throw new Error("Not implemented");
  }
}
