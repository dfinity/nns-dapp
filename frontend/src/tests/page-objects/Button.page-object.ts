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
  }): ButtonPo | null {
    const el = element.querySelector(`button[data-tid=${testId}]`);
    return el && new ButtonPo(el);
  }
}
