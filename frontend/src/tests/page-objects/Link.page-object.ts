import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

export class LinkPo extends BasePageObject {
  private static readonly DEFAULT_TID = "link-component";

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): LinkPo {
    if (isNullish(testId)) {
      return new LinkPo(element.byTestId(LinkPo.DEFAULT_TID));
    }
    return new LinkPo(element.byTestId(testId));
  }

  getHref(): Promise<string> {
    return this.root.getAttribute("href");
  }

  async click(): Promise<void> {
    return this.root.click();
  }

  async getAttribute(attributeName: string): Promise<string> {
    return this.root.getAttribute(attributeName);
  }
}
