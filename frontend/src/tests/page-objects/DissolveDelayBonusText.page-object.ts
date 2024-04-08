import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DissolveDelayBonusTextPo extends TooltipPo {
  private static readonly DISSOLVE_DELAY_BONUS_TEXT_TID =
    "dissolve-delay-bonus-text-component";

  static under(element: PageObjectElement): DissolveDelayBonusTextPo {
    return new DissolveDelayBonusTextPo(
      element.byTestId(DissolveDelayBonusTextPo.DISSOLVE_DELAY_BONUS_TEXT_TID)
    );
  }

  getText(): Promise<string> {
    return this.root.byTestId("dissolve-bonus-text").getText();
  }
}
