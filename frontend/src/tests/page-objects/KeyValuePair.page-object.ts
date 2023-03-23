import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class KeyValuePairPo extends BasePageObject {
  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): KeyValuePairPo {
    return new KeyValuePairPo(element.querySelector(`[data-tid=${testId}]`));
  }

  async getValueText(): Promise<string> {
    return this.root.querySelector("dd").getText();
  }
}
