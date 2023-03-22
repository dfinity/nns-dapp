import type { PageObjectElement } from "$tests/types/page-object.types";

/**
 * An implementation of the PageObjectElement interface for Jest unit tests.
 */
export class JestPageObjectElement implements PageObjectElement {
  private readonly element: Element;

  constructor(element: Element) {
    this.element = element;
  }

  querySelector(selector: string): JestPageObjectElement | null {
    const el = this.element.querySelector(selector);
    return el && new JestPageObjectElement(el);
  }

  querySelectorAll(selector: string): JestPageObjectElement[] {
    return Array.from(this.element.querySelectorAll(selector)).map(
      (el) => new JestPageObjectElement(el)
    );
  }

  get textContent(): string {
    return this.element.textContent;
  }
}
