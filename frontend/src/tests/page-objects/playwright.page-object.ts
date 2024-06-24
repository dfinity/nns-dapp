import type { PageObjectElement } from "$tests/types/page-object.types";
import type { Locator, Page } from "@playwright/test";

export class PlaywrightPageObjectElement implements PageObjectElement {
  readonly page: Page;
  readonly locator: Locator;

  constructor({ locator, page }: { locator: Locator; page: Page }) {
    this.locator = locator;
    this.page = page;
  }

  static fromPage(page: Page): PlaywrightPageObjectElement {
    return new PlaywrightPageObjectElement({
      locator: page.locator("body"),
      page,
    });
  }

  querySelector(selector: string): PlaywrightPageObjectElement {
    return new PlaywrightPageObjectElement({
      locator: this.locator.locator(selector).first(),
      page: this.page,
    });
  }

  async querySelectorAll(
    selector: string
  ): Promise<PlaywrightPageObjectElement[]> {
    return (await this.locator.locator(selector).all()).map(
      (locator) =>
        new PlaywrightPageObjectElement({
          locator,
          page: this.page,
        })
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
        new PlaywrightPageObjectElement({
          locator: this.locator.locator(selector).nth(i),
          page: this.page,
        })
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
    // Click in the corner to avoid clicking any `preventDefault` items inside.
    return this.locator.click( { position: { x: 5, y: 5 } });
  }

  input(value: string): Promise<void> {
    return this.locator.evaluate((node: HTMLInputElement, value: string) => {
      node.value = value;
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
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
    return PlaywrightPageObjectElement.fromPage(this.page);
  }

  async getTagName(): Promise<string> {
    throw new Error("Not implement");
  }
}
