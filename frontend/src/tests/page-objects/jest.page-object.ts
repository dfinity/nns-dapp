import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish, nonNullish } from "@dfinity/utils";
import { fireEvent, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

/**
 * An implementation of the PageObjectElement interface for Jest unit tests.
 */
export class JestPageObjectElement implements PageObjectElement {
  // The element represented by JestPageObjectElement is found by applying the
  // selector to the base element.
  private baseElement: Element;
  private readonly selector: string | undefined;

  constructor(element: Element, params?: { selector: string }) {
    this.baseElement = element;
    this.selector = params?.selector;
  }

  getElement(): Element | null {
    return isNullish(this.selector)
      ? this.baseElement
      : this.baseElement?.querySelector(this.selector) ?? null;
  }

  querySelector(selector: string): JestPageObjectElement {
    return new JestPageObjectElement(this.baseElement, {
      selector: isNullish(this.selector)
        ? selector
        : `${this.selector} ${selector}`,
    });
  }

  async querySelectorAll(selector: string): Promise<JestPageObjectElement[]> {
    if (isNullish(this.getElement())) {
      return [];
    }
    return Array.from(this.getElement().querySelectorAll(selector)).map(
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

  private isInputElement(element: Element): element is HTMLInputElement {
    return element.tagName === "INPUT";
  }

  async getValue() {
    const element = this.getElement();
    if ("value" in element) {
      // TS doesn't know that the "value" property is of type string
      return element.value as string;
    }
    throw new Error(
      `"value" property is not supported for element: "${element.tagName}"`
    );
  }

  async isPresent(): Promise<boolean> {
    return nonNullish(this.getElement());
  }

  waitFor(): Promise<void> {
    return waitFor(async () => {
      expect(await this.isPresent()).toBe(true);
    });
  }

  waitForAbsent(): Promise<void> {
    return waitFor(async () => {
      return expect(await this.isPresent()).toBe(false);
    });
  }

  // Resolves to null if the element is not present.
  async getText(): Promise<string | null> {
    return this.getElement() && this.getElement().textContent;
  }

  // Resolves to null if the element is not present.
  async getAttribute(attribute: string): Promise<string | null> {
    return this.getElement() && this.getElement().getAttribute(attribute);
  }

  async getClasses(): Promise<string[] | null> {
    return this.getElement() && Array.from(this.getElement().classList);
  }

  async isChecked(): Promise<boolean> {
    const element = this.getElement();
    if ("checked" in element) {
      // TS doesn't know that the "checked" property is of type boolean
      return element.checked as boolean;
    }
    throw new Error(
      `"checked" property is not supported for element: "${element.tagName}"`
    );
  }

  async click(): Promise<void> {
    await this.waitFor();
    await fireEvent.click(this.getElement());
  }

  async input(value: string): Promise<void> {
    await this.waitFor();
    // Svelte generates code for listening to the `input` event, not the `change` event in input fields.
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    await fireEvent.input(this.getElement(), { target: { value } });
  }

  async typeText(text: string): Promise<void> {
    return this.input(text);
  }

  async selectOption(text: string): Promise<void> {
    await this.waitFor();
    return userEvent.selectOptions(this.getElement(), text);
  }

  async isVisible(): Promise<boolean> {
    try {
      expect(this.getElement()).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async blur(): Promise<void> {
    await this.waitFor();
    await fireEvent.blur(this.getElement());
  }

  async innerHtmlForDebugging(): Promise<string> {
    await this.waitFor();
    return this.getElement()?.innerHTML ?? "";
  }

  async addEventListener(
    eventType: string,
    fn: (e: Event) => void
  ): Promise<void> {
    await this.waitFor();
    this.getElement()?.addEventListener(eventType, fn);
  }
}
