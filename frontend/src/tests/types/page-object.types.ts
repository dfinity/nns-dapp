/**
 * A platform agnostic interface for page objects to interact with elements.
 * Platforms might include Jest and Playwright.
 */
export interface PageObjectElement {
  querySelector(selector: string): PageObjectElement;
  querySelectorAll(selector: string): Promise<PageObjectElement[]>;
  isPresent(): Promise<boolean>;
  getText(): Promise<string | null>;
  click(): Promise<void>;
}
