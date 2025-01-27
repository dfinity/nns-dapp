import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VestingTooltipWrapperPo extends BasePageObject {
  private static readonly TID = "sns-neuron-vesting-tooltip-component";

  static under(element: PageObjectElement): VestingTooltipWrapperPo {
    return new VestingTooltipWrapperPo(
      element.byTestId(VestingTooltipWrapperPo.TID)
    );
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }
}
