import { BasePageObject } from "$tests/page-objects/base.page-object";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcpExchangeRatePo extends BasePageObject {
  private static readonly TID = "icp-exchange-rate-component";

  static under(element: PageObjectElement): IcpExchangeRatePo {
    return new IcpExchangeRatePo(element.byTestId(IcpExchangeRatePo.TID));
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
  }

  getIcpPrice(): Promise<string> {
    return this.getText("icp-price");
  }

  getTooltipText(): Promise<string> {
    const tooltipIconPo = this.getTooltipIconPo();
    return tooltipIconPo.getTooltipText();
  }

  async hasError(): Promise<boolean> {
    const classNames = await this.root.getClasses();
    return classNames.includes("has-error");
  }
}
