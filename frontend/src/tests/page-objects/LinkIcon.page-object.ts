import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LinkIconPo extends BasePageObject {
  private static readonly TID = "link-icon-component";

  static under(element: PageObjectElement): LinkIconPo {
    return new LinkIconPo(element.byTestId(LinkIconPo.TID));
  }

  getHref(): Promise<string> {
    return this.root.getAttribute("href");
  }
}
