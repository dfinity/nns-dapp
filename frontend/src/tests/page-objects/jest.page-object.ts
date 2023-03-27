import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish, nonNullish } from "@dfinity/utils";
import { fireEvent } from "@testing-library/svelte";

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

  byTestId(tid: string): JestPageObjectElement {
    return this.querySelector(`[data-tid=${tid}]`);
  }

  allByTestId(tid: string): Promise<JestPageObjectElement[]> {
    return this.querySelectorAll(`[data-tid=${tid}]`);
  }

  async isPresent(): Promise<boolean> {
    return nonNullish(this.element);
  }

  waitFor(): Promise<void> {
    // TODO:
    // To be able to implement this, querySelector shouldn't immediately get an
    // element but rather concattenate the selectors. If we already have a null
    // element, it's too late to wait for it.
    throw new Error("Not implemented");
  }

  waitForAbsent(): Promise<void> {
    // TODO:
    // To be able to implement this, querySelector shouldn't immediately get an
    // element but rather concattenate the selectors.
    throw new Error("Not implemented");
  }

  // Resolves to null if the element is not present.
  async getText(): Promise<string | null> {
    return this.element && this.element.textContent;
  }

  async click(): Promise<void> {
    await fireEvent.click(this.element);
  }

  async type(_text: string): Promise<void> {
    throw new Error("Not implemented");
    // Not tested:
    // fireEvent.change(input, {target: {value: text}})
  }
}
