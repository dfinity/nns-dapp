import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IncreaseStakeButtonPo extends BasePageObject {
  private static readonly TID = "increase-stake-button-component";

  static under(element: PageObjectElement): IncreaseStakeButtonPo {
    return new IncreaseStakeButtonPo(
      element.byTestId(IncreaseStakeButtonPo.TID)
    );
  }
}
