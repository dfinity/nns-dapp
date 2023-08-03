import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class CommonItemActionPo extends BasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): CommonItemActionPo {
    return new CommonItemActionPo(element.byTestId(testId));
  }

  async getTitle(): Promise<string> {
    return this.root.byTestId("title").getText();
  }

  async getSubtitle(): Promise<string> {
    return this.root.byTestId("subtitle").getText();
  }
}
