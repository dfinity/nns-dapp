import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish, nonNullish } from "@dfinity/utils";
import { fireEvent, waitFor } from "@testing-library/svelte";

/**
 * An implementation of the PageObjectElement interface for Jest unit tests.
 */
export class JestPageObjectElement implements PageObjectElement {
  private element: Element | null;
  private readonly selector: string | undefined;
  private readonly parent: JestPageObjectElement | undefined;

  constructor(
    element: Element | null,
    params?: { parent: JestPageObjectElement; selector: string }
  ) {
    this.element = element;
    this.selector = params?.selector;
    this.parent = params?.parent;
  }

  querySelector(selector: string): JestPageObjectElement {
    const el = this.element && this.element.querySelector(selector);
    return new JestPageObjectElement(el, { parent: this, selector });
  }

  async querySelectorAll(selector: string): Promise<JestPageObjectElement[]> {
    if (isNullish(this.element)) {
      return [];
    }
    return Array.from(this.element.querySelectorAll(selector)).map(
      (el) => new JestPageObjectElement(el)
    );
  }

  querySelectorCount({
    selector: _selector,
    count: _count,
  }: {
    selector: string;
    count: number;
  }): JestPageObjectElement[] {
    throw new Error("Not implemented");
  }

  byTestId(tid: string): JestPageObjectElement {
    return this.querySelector(`[data-tid=${tid}]`);
  }

  allByTestId(tid: string): Promise<JestPageObjectElement[]> {
    return this.querySelectorAll(`[data-tid=${tid}]`);
  }

  countByTestId({
    tid: _tid,
    count: _count,
  }: {
    tid: string;
    count: number;
  }): JestPageObjectElement[] {
    throw new Error("Not implemented");
    // Not tested:
    // return this.querySelectorCount({ selector: `[data-tid=${tid}]`, count });
  }

  async isPresent(): Promise<boolean> {
    return nonNullish(this.element);
  }

  async waitFor(): Promise<void> {
    if (await this.isPresent()) {
      return;
    }
    await this.parent.waitFor();
    await waitFor(() => {
      this.element = this.parent?.element.querySelector(this.selector);
      expect(this.element).not.toBeNull();
    });
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

  // Resolves to null if the element is not present.
  async getAttribute(attribute: string): Promise<string | null> {
    return this.element && this.element.getAttribute(attribute);
  }

  async click(): Promise<void> {
    await fireEvent.click(this.element);
  }

  async typeText(text: string): Promise<void> {
    // Svelte generates code for listening to the `input` event, not the `change` event in input fields.
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    await fireEvent.input(this.element, { target: { value: text } });
  }

  async selectOption(_text: string): Promise<void> {
    throw new Error("Not implemented");
    // Not tested:
    // userEvent.selectOption(this.element, text);
  }
}
