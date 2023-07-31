import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ExpandableSectionPo extends BasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): ExpandableSectionPo {
    return new ExpandableSectionPo(element.byTestId(testId));
  }

  async clickTitle(): Promise<void> {
    return this.click("clickable-title");
  }

  getExpandedDescription(): PageObjectElement {
    return this.root.byTestId("expanded-description");
  }

  async isExpandedDescriptionVisible(): Promise<boolean> {
    return this.getExpandedDescription().isVisible();
  }

  async getVisibleDescription(): Promise<string> {
    const initialDescription = await this.root
      .byTestId("initial-description")
      .getText();
    this.root.byTestId("initial-description").isVisible();
    const expandedDescription = await this.getExpandedDescription().getText();
    return (await this.isExpandedDescriptionVisible())
      ? initialDescription + expandedDescription
      : initialDescription;
  }
}
