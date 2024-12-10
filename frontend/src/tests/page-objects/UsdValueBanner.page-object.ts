import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UsdValueBannerPo extends BasePageObject {
  private static readonly TID = "usd-value-banner-component";

  static under(element: PageObjectElement): UsdValueBannerPo {
    return new UsdValueBannerPo(element.byTestId(UsdValueBannerPo.TID));
  }

  getTotalsTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root.querySelector(".totals"));
  }

  getExchangeRateTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root.querySelector(".exchange-rate"));
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
    const classNames = await this.root.getClasses();
    return classNames.includes("has-error");
  }
}
