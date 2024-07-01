import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TooltipIconPo extends BasePageObject {
  private static readonly TID = "tooltip-icon-component";

  static under(element: PageObjectElement): TooltipIconPo {
    return new TooltipIconPo(element.byTestId(TooltipIconPo.TID));
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getTooltipText(): Promise<string> {
    return this.getTooltipPo().getTooltipText();
  }
}
