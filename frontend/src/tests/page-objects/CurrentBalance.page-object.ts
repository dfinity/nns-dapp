import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CurrentBalancePo extends BasePageObject {
  private static readonly TID = "current-balance-component";

  static under(element: PageObjectElement): CurrentBalancePo {
    return new CurrentBalancePo(element.byTestId(CurrentBalancePo.TID));
  }

  get AmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }
}
