import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UsdValueBannerPo extends BasePageObject {
  private static readonly TID = "usd-value-banner-component";

  static under(element: PageObjectElement): UsdValueBannerPo {
    return new UsdValueBannerPo(element.byTestId(UsdValueBannerPo.TID));
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
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
}
