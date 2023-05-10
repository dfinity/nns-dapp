import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish, nonNullish } from "@dfinity/utils";
import { fireEvent, waitFor } from "@testing-library/svelte";

/**
 * An implementation of the PageObjectElement interface for Jest unit tests.
 */
export class VitestPageObjectElement implements PageObjectElement {
  private element: Element | null;
  private readonly selector: string | undefined;
  private readonly parent: VitestPageObjectElement | undefined;

  constructor(
    element: Element | null,
    params?: { parent: VitestPageObjectElement; selector: string }
  ) {
    this.element = element;
    this.selector = params?.selector;
    this.parent = params?.parent;
  }

  querySelector(selector: string): VitestPageObjectElement {
    const el = this.element && this.element.querySelector(selector);
    return new VitestPageObjectElement(el, { parent: this, selector });
  }

  async querySelectorAll(selector: string): Promise<VitestPageObjectElement[]> {
    if (isNullish(this.element)) {
      return [];
    }
    return Array.from(this.element.querySelectorAll(selector)).map(
      (el) => new VitestPageObjectElement(el)
    );
  }

  querySelectorCount({
    selector: _selector,
    count: _count,
  }: {
    selector: string;
    count: number;
  }): VitestPageObjectElement[] {
    throw new Error("Not implemented");
  }

  byTestId(tid: string): VitestPageObjectElement {
    return this.querySelector(`[data-tid=${tid}]`);
  }

  allByTestId(tid: string): Promise<VitestPageObjectElement[]> {
    return this.querySelectorAll(`[data-tid=${tid}]`);
  }

  countByTestId({
    tid: _tid,
    count: _count,
  }: {
    tid: string;
    count: number;
  }): VitestPageObjectElement[] {
    throw new Error("Not implemented");
    // Not tested:
    // return this.querySelectorCount({ selector: `[data-tid=${tid}]`, count });
  }

  private getRootAndFullSelector(): {
    rootElement: Element;
    fullSelector: string;
  } {
    if (isNullish(this.parent)) {
      return { rootElement: this.element, fullSelector: ":scope" };
    }
    const { rootElement, fullSelector } = this.parent.getRootAndFullSelector();
    return {
      rootElement,
      fullSelector: `${fullSelector} ${this.selector}`,
    };
  }

  async isPresent(): Promise<boolean> {
    const { rootElement, fullSelector } = this.getRootAndFullSelector();
    this.element = rootElement.querySelector(fullSelector);
    return nonNullish(this.element);
  }

  waitFor(): Promise<void> {
    return waitFor(async () => {
      expect(await this.isPresent()).toBe(true);
    });
  }

  waitForAbsent(): Promise<void> {
    return waitFor(async () => {
      expect(await this.isPresent()).toBe(false);
    });
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
