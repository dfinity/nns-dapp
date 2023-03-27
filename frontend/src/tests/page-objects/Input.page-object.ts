import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

// Don't extend BasePageObject to avoid circular dependency with
// BasePageObject.getInput().
export class InputPo {
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
  }): InputPo {
    if (isNullish(testId)) {
      return new InputPo(element.querySelector("input"));
    }
    return new InputPo(element.querySelector(`input[data-tid=${testId}]`));
  }

  type(text: string): Promise<void> {
    return this.root.type(text);
  }
}
