import { HeldTokensCardPo } from "$tests/page-objects/HeldTokensCard.page-object";
import { NoStakedTokensCardPo } from "$tests/page-objects/NoStakedTokensCard.page-object";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { StakedTokensCardPo } from "./StakedTokensCard.page-object";

export class PortfolioPagePo extends BasePageObject {
  private static readonly TID = "portfolio-page-component";

  static under(element: PageObjectElement): PortfolioPagePo {
    return new PortfolioPagePo(element.byTestId(PortfolioPagePo.TID));
  }

  getLoginCard(): PageObjectElement {
    return this.getElement("portfolio-login-card");
  }

  getNoHeldTokensCard(): PageObjectElement {
    return this.getElement("no-held-tokens-card");
  }

  getNoStakedTokensCarPo(): NoStakedTokensCardPo {
    return NoStakedTokensCardPo.under(this.root);
  }

  getUsdValueBannerPo(): UsdValueBannerPo {
    return UsdValueBannerPo.under(this.root);
  }

  getHeldTokensCardPo(): HeldTokensCardPo {
    return HeldTokensCardPo.under(this.root);
  }

  getStakedTokensCardPo(): StakedTokensCardPo {
    return StakedTokensCardPo.under(this.root);
  }
}
