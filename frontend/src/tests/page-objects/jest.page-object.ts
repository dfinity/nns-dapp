import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish, nonNullish } from "@dfinity/utils";
import { fireEvent, waitFor } from "@testing-library/svelte";

const SELF_SELECTOR = ":scope";

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

  private getRootAndFullSelector(): {
    rootElement: Element;
    fullSelector: string;
  } {
    if (isNullish(this.parent)) {
      return { rootElement: this.element, fullSelector: SELF_SELECTOR };
    }
    const { rootElement, fullSelector } = this.parent.getRootAndFullSelector();
    return {
      rootElement,
      fullSelector: `${fullSelector} ${this.selector}`,
    };
  }

  async isPresent(): Promise<boolean> {
    const { rootElement, fullSelector } = this.getRootAndFullSelector();
    if (fullSelector !== SELF_SELECTOR) {
      // I would expect that element.querySelector(":scope") would return the
      // element itself, but it doesn't. So we skip this step if
      // fullSelector === SELF_SELECTOR.
      this.element = rootElement.querySelector(fullSelector);
    }
    return nonNullish(this.element);
  }

  waitFor(): Promise<void> {
    return waitFor(async () => {
      expect(await this.isPresent()).toBe(true);
    });
  }

  waitForAbsent(): Promise<void> {
    return waitFor(
      async () => {
        return expect(await this.isPresent()).toBe(false);
      },
      // TODO: Needed for the swap participation flow. Remove.
      // To remove we need to use different describes in ProjectDetail.spec.ts
      // Describes that mock timers and describes that don't.
      { timeout: 5_000 }
    );
  }

  // Resolves to null if the element is not present.
  async getText(): Promise<string | null> {
    return this.element && this.element.textContent;
  }

  // Resolves to null if the element is not present.
  async getAttribute(attribute: string): Promise<string | null> {
    return this.element && this.element.getAttribute(attribute);
  }

  async getClasses(): Promise<string[] | null> {
    return this.element && Array.from(this.element.classList);
  }

  async click(): Promise<void> {
    await this.waitFor();
    await fireEvent.click(this.element);
  }

  async typeText(text: string): Promise<void> {
    await this.waitFor();
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
