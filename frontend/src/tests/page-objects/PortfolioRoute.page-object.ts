import { PortfolioPagePo } from "$tests/page-objects/PortfolioPage.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class PortfolioRoutePo extends BasePageObject {
  private static readonly TID = "portfolio-route-component";

  static under(element: PageObjectElement): PortfolioRoutePo {
    return new PortfolioRoutePo(element.byTestId(PortfolioRoutePo.TID));
  }

  getPortfolioPagePo(): PortfolioPagePo {
    return PortfolioPagePo.under(this.root);
  }
}
