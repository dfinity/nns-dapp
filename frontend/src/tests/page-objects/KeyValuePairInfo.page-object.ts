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
    // Before: `return this.root.byTestId("collapsible-content").isVisible();`
    // But Vitest returns `true` for `.toBeVisible()` when the element has height: 0px.
    const el = this.root.byTestId("collapsible-content");
    // We rely on the implementation detail that the height is set inline style.
    const styles = await el.getAttribute("style");
    const height = Number(styles?.match(/height: (\d+)px/)?.[1]);
    return height > 0;
  }
}
