import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ApyFallbackCardPo extends BasePageObject {
  private static readonly TID = "apy-fallback-card";

  static under(element: PageObjectElement): ApyFallbackCardPo {
    return new ApyFallbackCardPo(element.byTestId(ApyFallbackCardPo.TID));
  }

  getErrorContent(): PageObjectElement {
    return this.getElement("error-content");
  }

  getLoadingContent(): PageObjectElement {
    return this.getElement("loading-content");
  }
}
