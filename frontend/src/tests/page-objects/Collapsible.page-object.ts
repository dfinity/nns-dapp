import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CollapsiblePo extends BasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): CollapsiblePo {
    return new CollapsiblePo(element.byTestId(testId));
  }

  expand(): Promise<void> {
    return this.click("collapsible-expand-button");
  }

  async isExpanded(): Promise<boolean> {
    const classes = await this.root
      .byTestId("collapsible-content")
      .getClasses();
    return classes.includes("expanded");
  }
}
