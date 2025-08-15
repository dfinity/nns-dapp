import { ApyCardPo } from "$tests/page-objects/ApyCard.page-object";
import { ApyFallbackCardPo } from "$tests/page-objects/ApyFallbackCard.page-object";
import { HeldTokensCardPo } from "$tests/page-objects/HeldTokensCard.page-object";
import { StackedCardsPo } from "$tests/page-objects/StackedCards.page-object";
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

  getStartStakingCard(): PageObjectElement {
    return this.getElement("start-staking-card");
  }

  getNoHeldIcpCard(): PageObjectElement {
    return this.getElement("no-held-icp-card");
  }

  getNoHeldTokensCard(): PageObjectElement {
    return this.getElement("no-held-tokens-card");
  }

  getNoStakedIcpCardPo(): PageObjectElement {
    return this.getElement("no-staked-icp-card");
  }

  getNoStakedTokensCardPo(): PageObjectElement {
    return this.getElement("no-staked-tokens-card");
  }

  getTotalAssetsCardPo(): TotalAssetsCardPo {
    return TotalAssetsCardPo.under(this.root);
  }

  getApyFallbackCardPo(): ApyFallbackCardPo {
    return ApyFallbackCardPo.under(this.root);
  }

  getApyCardPo(): ApyCardPo {
    return ApyCardPo.under(this.root);
  }

  getHeldICPCardPo(): HeldTokensCardPo {
    return HeldTokensCardPo.under({
      element: this.root,
      testId: "held-icp-card",
    });
  }

  getHeldRestTokensCardPo(): HeldTokensCardPo {
    return HeldTokensCardPo.under({ element: this.root });
  }

  getStakedICPCardPo(): StakedTokensCardPo {
    return StakedTokensCardPo.under({
      element: this.root,
      testId: "staked-icp-card",
    });
  }

  getStakedRestTokensCardPo(): StakedTokensCardPo {
    return StakedTokensCardPo.under({ element: this.root });
  }

  getHeldIcpSkeletonCard(): PageObjectElement {
    return this.getElement("held-icp-skeleton-card");
  }

  getHeldTokensSkeletonCard(): PageObjectElement {
    return this.getElement("held-tokens-skeleton-card");
  }

  getStakedTokensSkeletonCard(): PageObjectElement {
    return this.getElement("staked-tokens-skeleton-card");
  }

  getStakedIcpSkeletonCard(): PageObjectElement {
    return this.getElement("staked-icp-skeleton-card");
  }

  getStackedCardsPo(): StackedCardsPo {
    return StackedCardsPo.under(this.root);
  }
}
