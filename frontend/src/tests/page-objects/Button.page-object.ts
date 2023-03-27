import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

// Don't extend BasePageObject to avoid circular dependency with
// BasePageObject.getButton().
export class ButtonPo {
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
  }): ButtonPo {
    if (isNullish(testId)) {
      return new ButtonPo(element.querySelector("button"));
    }
    return new ButtonPo(element.querySelector(`button[data-tid=${testId}]`));
  }

  isPresent(): Promise<boolean> {
    return this.root.isPresent();
  }

  click(): Promise<void> {
    return this.root.click();
  }
}
