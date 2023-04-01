import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

export class TextInputPo {
  readonly root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): TextInputPo {
    if (isNullish(testId)) {
      return new TextInputPo(
        element.querySelector("input[type=text], input:not([type])")
      );
    }
    return new TextInputPo(
      element.querySelector(
        `input[type=text][data-tid=${testId}], input:not([type])[data-tid=${testId}]`
      )
    );
  }

  typeText(text: string): Promise<void> {
    return this.root.typeText(text);
  }

  // TextInputPo does not extend `PageObjectElement` therefore, we need to add the methods we need here.
  async waitFor(): Promise<void> {
    return this.root.waitFor();
  }
}
