import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class AgeBonusTextPo extends TooltipPo {
  private static readonly AGE_BONUS_TEXT_TID = "age-bonus-text-component";

  static under(element: PageObjectElement): AgeBonusTextPo {
    return new AgeBonusTextPo(element.byTestId(AgeBonusTextPo.AGE_BONUS_TEXT_TID));
  }

  getText(): Promise<string> {
    return this.root.byTestId("age-bonus-text").getText();
  }
}
