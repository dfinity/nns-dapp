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
  }): KeyValuePairPo | null {
    const el = element.querySelector(`[data-tid=${testId}]`);
    return el && new KeyValuePairPo(el);
  }

  async getValueText(): Promise<string> {
    const valueElement = await this.root.querySelector("dd");
    return valueElement.getText();
  }
}
