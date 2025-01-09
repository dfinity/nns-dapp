import type { PageObjectElement } from "$tests/types/page-object.types";
import { NoNeuronsCardPo } from "./NoNeuronsCard.page-object";
import { UsdValueBannerPo } from "./UsdValueBanner.page-object";
import { BasePageObject } from "./base.page-object";

export class PortfolioPagePo extends BasePageObject {
  private static readonly TID = "portfolio-page-component";

  static under(element: PageObjectElement): PortfolioPagePo {
    return new PortfolioPagePo(element.byTestId(PortfolioPagePo.TID));
  }

  getLoginCard(): PageObjectElement {
    return this.getElement("portfolio-login-card");
  }

  getNoTokensCard(): PageObjectElement {
    return this.getElement("no-tokens-card");
  }

  getNoNeuronsCarPo(): NoNeuronsCardPo {
    return NoNeuronsCardPo.under(this.root);
  }

  getUsdValueBannerPo(): UsdValueBannerPo {
    return UsdValueBannerPo.under(this.root);
  }
}
