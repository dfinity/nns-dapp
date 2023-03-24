import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ButtonPo extends BasePageObject {
  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): ButtonPo {
    return new ButtonPo(element.querySelector(`button[data-tid=${testId}]`));
  }

  click(): Promise<void> {
    return this.root.click();
  }
}
