import { HeldTokensCardPo } from "$tests/page-objects/HeldTokensCard.page-object";
import { NoStakedTokensCardPo } from "$tests/page-objects/NoStakedTokensCard.page-object";
import { StakedTokensCardPo } from "$tests/page-objects/StakedTokensCard.page-object";
import { TotalAssetsCardPo } from "$tests/page-objects/TotalAssetsCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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

  getTotalAssetsCardPo(): TotalAssetsCardPo {
    return TotalAssetsCardPo.under(this.root);
  }

  getHeldTokensCardPo(): HeldTokensCardPo {
    return HeldTokensCardPo.under(this.root);
  }

  getStakedTokensCardPo(): StakedTokensCardPo {
    return StakedTokensCardPo.under(this.root);
  }

  async getNumberOfSkeletonCards(): Promise<number> {
    const skeletons = await this.root.allByTestId("skeleton-tokens-card");
    return skeletons.length;
  }
}
