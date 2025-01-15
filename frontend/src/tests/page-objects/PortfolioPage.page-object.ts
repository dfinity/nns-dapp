import { NoProjectsCardPo } from "$tests/page-objects/NoProjectsCard.page-object";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TokensCardPo } from "./TokensCard.page-object";

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

  getNoNeuronsCarPo(): NoProjectsCardPo {
    return NoProjectsCardPo.under(this.root);
  }

  getUsdValueBannerPo(): UsdValueBannerPo {
    return UsdValueBannerPo.under(this.root);
  }

  getTokensCardPo(): TokensCardPo {
    return TokensCardPo.under(this.root);
  }
}
