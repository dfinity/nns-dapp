import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish, nonNullish } from "@dfinity/utils";

/**
 * An implementation of the PageObjectElement interface for Jest unit tests.
 */
export class JestPageObjectElement implements PageObjectElement {
  private readonly element: Element | null;

  constructor(element: Element | null) {
    this.element = element;
  }

  querySelector(selector: string): JestPageObjectElement {
    const el = this.element && this.element.querySelector(selector);
    return new JestPageObjectElement(el);
  }

  async querySelectorAll(selector: string): Promise<JestPageObjectElement[]> {
    if (isNullish(this.element)) {
      return [];
    }
    return Array.from(this.element.querySelectorAll(selector)).map(
      (el) => new JestPageObjectElement(el)
    );
  }

  async isPresent(): Promise<boolean> {
    return nonNullish(this.element);
  }

  // Resolves to null if the element is not present.
  async getText(): Promise<string | null> {
    return this.element && this.element.textContent;
  }
}
