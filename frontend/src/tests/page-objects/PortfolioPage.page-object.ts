import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class PortfolioPagePo extends BasePageObject {
  private static readonly TID = "portfolio-page-component";

  static under(element: PageObjectElement): PortfolioPagePo {
    return new PortfolioPagePo(element.byTestId(PortfolioPagePo.TID));
  }

  getLoginCard() {
    return this.getElement("portfolio-login-card");
  }
}
