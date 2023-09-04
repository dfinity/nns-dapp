import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class AgeBonusTextPo extends BasePageObject {
  private static readonly TID = "age-bonus-text-component";

  static under(element: PageObjectElement): AgeBonusTextPo {
    return new AgeBonusTextPo(element.byTestId(AgeBonusTextPo.TID));
  }

  getTooltipText(): Promise<string> {
    return assertNonNullish(this.root.querySelector(".tooltip")).getText();
  }

  getText(): Promise<string> {
    return this.root.byTestId("age-bonus-text").getText();
  }
}
