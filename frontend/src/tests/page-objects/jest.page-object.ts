import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish, nonNullish } from "@dfinity/utils";
import { fireEvent } from "@testing-library/svelte";

/**
 * An implementation of the PageObjectElement interface for Jest unit tests.
 */
export class JestPageObjectElement implements PageObjectElement {
  private static readonly MAX_RETRIES = 5;
  private static readonly WAIT_FOR_INTERVAL_MILLIS = 500;
  private element: Element | null;
  private readonly selector: string | undefined;
  private readonly parent: Element | undefined | null;

  constructor(
    element: Element | null,
    params?: { parent: Element | null; selector: string }
  ) {
    this.element = element;
    this.selector = params?.selector;
    this.parent = params?.parent;
  }

  querySelector(selector: string): JestPageObjectElement {
    const el = this.element && this.element.querySelector(selector);
    return new JestPageObjectElement(el, { parent: this.element, selector });
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
    return new Promise((resolve, reject) => {
      let count = 0;
      const intervalId = setInterval(() => {
        this.element = this.parent?.querySelector(this.selector);
        if (nonNullish(this.element)) {
          clearInterval(intervalId);
          resolve();
        } else if (count > JestPageObjectElement.MAX_RETRIES) {
          clearInterval(intervalId);
          reject(
            `Element with selector ${this.selector} not found after ${
              JestPageObjectElement.WAIT_FOR_INTERVAL_MILLIS *
              JestPageObjectElement.MAX_RETRIES
            } milliseconds`
          );
        }
        count += 1;
      }, JestPageObjectElement.WAIT_FOR_INTERVAL_MILLIS);
    });
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
