import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class KeyValuePairInfoPo extends BasePageObject {
  private parent: PageObjectElement;
  private testId: string;

  /**
   * KeyValuePairInfo renders two components:
   * - a div with the key value pair and a button
   * - a div with the description information
   *
   * That's why we need to keep a reference to the parent element
   * to be able to get the description information
   */
  constructor({
    parent,
    element,
    testId,
  }: {
    element: PageObjectElement;
    parent: PageObjectElement;
    testId: string;
  }) {
    super(element);
    this.parent = parent;
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
      parent: element,
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
    return this.parent.byTestId(`${this.testId}-description`).getText();
  }
}
