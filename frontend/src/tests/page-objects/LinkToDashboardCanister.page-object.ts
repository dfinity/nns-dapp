import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

export class LinkToDashboardCanisterPo extends BasePageObject {
  private static readonly TID = "link-to-dashboard-canister-component";

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): LinkToDashboardCanisterPo {
    if (isNullish(testId)) {
      return new LinkToDashboardCanisterPo(
        element.byTestId(LinkToDashboardCanisterPo.TID)
      );
    }
    return new LinkToDashboardCanisterPo(element.byTestId(testId));
  }

  getLabel(): PageObjectElement {
    return this.root.byTestId("label");
  }

  getHref(): Promise<string> {
    return this.root.getAttribute("href");
  }

  async getLabelText(): Promise<string> {
    return (await this.getLabel().getText()).trim();
  }
}
