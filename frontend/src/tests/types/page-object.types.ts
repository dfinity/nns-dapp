/**
 * A platform agnostic interface for page objects to interact with elements.
 * Platforms might include Jest and Playwright.
 */
export interface PageObjectElement {
  querySelector(selector: string): PageObjectElement;
  querySelectorAll(selector: string): Promise<PageObjectElement[]>;
  querySelectorCount({
    selector,
    count,
  }: {
    selector: string;
    count: number;
  }): PageObjectElement[];
  byTestId(tid: string): PageObjectElement;
  allByTestId(tid: string): Promise<PageObjectElement[]>;
  countByTestId({
    tid,
    count,
  }: {
    tid: string;
    count: number;
  }): PageObjectElement[];
  isPresent(): Promise<boolean>;
  /**
   * Defaults to `'visible'`. Can be either:
   * - `'attached'` - wait for element to be present in DOM.
   * - `'detached'` - wait for element to not be present in DOM.
   * - `'visible'` - wait for element to have non-empty bounding box and no `visibility:hidden`. Note that element
   *   without any content or with `display:none` has an empty bounding box and is not considered visible.
   * - `'hidden'` - wait for element to be either detached from DOM, or have an empty bounding box or
   *   `visibility:hidden`. This is opposite to the `'visible'` option.
   *
   * Useful for example to wait for options to appear in a dropdown.
   */
  waitFor(options?: {
    state: "attached" | "detached" | "visible" | "hidden";
  }): Promise<void>;
  waitForAbsent(timeout?: number): Promise<void>;
  getText(): Promise<string | null>;
  getAttribute(attribute: string): Promise<string | null>;
  getClasses(): Promise<string[] | null>;
  click(): Promise<void>;
  input(value: string): Promise<void>;
  isChecked(): Promise<boolean>;
  typeText(text: string): Promise<void>;
  selectOption(option: string): Promise<void>;
  getValue(): Promise<string>;
  isVisible(): Promise<boolean>;
  blur(): Promise<void>;
  innerHtmlForDebugging(): Promise<string>;
  addEventListener(eventType: string, fn: (e: Event) => void): Promise<void>;
}
