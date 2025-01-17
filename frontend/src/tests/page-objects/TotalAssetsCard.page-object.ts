import { IcpExchangeRatePo } from "$tests/page-objects/IcpExchangeRate.page-object";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TotalAssetsCardPo extends BasePageObject {
  private static readonly TID = "total-assets-card-component";

  static under(element: PageObjectElement): TotalAssetsCardPo {
    return new TotalAssetsCardPo(element.byTestId(TotalAssetsCardPo.TID));
  }

  getTotalsTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root.querySelector(".totals"));
  }

  getIcpExchangeRatePo(): IcpExchangeRatePo {
    return IcpExchangeRatePo.under(this.root);
  }

  getPrimaryAmount(): Promise<string> {
    return this.getText("primary-amount");
  }

  getSecondaryAmount(): Promise<string> {
    return this.getText("secondary-amount");
  }

  getIcpPrice(): Promise<string> {
    return this.getText("icp-price");
  }

  async hasError(): Promise<boolean> {
    return this.getIcpExchangeRatePo().hasError();
  }
}
