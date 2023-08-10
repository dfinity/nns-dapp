import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class KeyValuePairInfoPo extends BasePageObject {
  private testId: string;

  constructor({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }) {
    super(element);
    this.testId = testId;
  }

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): KeyValuePairInfoPo {
    return new KeyValuePairInfoPo({
      element: element.byTestId(testId),
      testId,
    });
  }

  async getValueText(): Promise<string> {
    return this.root.querySelector("dd").getText();
  }

  clickInfoIcon(): Promise<void> {
    return this.getButton().click();
  }

  getDescriptionText(): Promise<string> {
    return this.getText(`${this.testId}-description`);
  }

  async isDescriptionVisible(): Promise<boolean> {
    return this.root.byTestId("collapsible-content").isVisible();
  }
}
