/**
 * A platform agnostic interface for page objects to interact with elements.
 * Platforms might include Jest and Playwright.
 */
export interface PageObjectElement {
  querySelector(selector: string): PageObjectElement;
  querySelectorAll(selector: string): Promise<PageObjectElement[]>;
  byTestId(tid: string): PageObjectElement;
  allByTestId(tid: string): Promise<PageObjectElement[]>;
  isPresent(): Promise<boolean>;
  waitFor(): Promise<void>;
  waitForAbsent(): Promise<void>;
  getText(): Promise<string | null>;
  click(): Promise<void>;
  typeText(text: string): Promise<void>;
  selectOption(option: string): Promise<void>;
}
