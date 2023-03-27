import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

// Don't extend BasePageObject to avoid circular dependency with
// BasePageObject.getTextInput().
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
      return new TextInputPo(element.querySelector("input"));
    }
    return new TextInputPo(element.querySelector(`input[data-tid=${testId}]`));
  }

  type(text: string): Promise<void> {
    return this.root.type(text);
  }
}
