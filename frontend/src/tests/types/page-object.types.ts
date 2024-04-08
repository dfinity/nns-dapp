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
  waitFor(): Promise<void>;
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
  getDocumentBody(): Promise<PageObjectElement>;
}
