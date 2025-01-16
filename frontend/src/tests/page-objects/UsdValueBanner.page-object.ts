import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { IcpExchangeRatePo } from "./IcpExchangeRate.page-object";

export class UsdValueBannerPo extends BasePageObject {
  private static readonly TID = "usd-value-banner-component";

  static under(element: PageObjectElement): UsdValueBannerPo {
    return new UsdValueBannerPo(element.byTestId(UsdValueBannerPo.TID));
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
