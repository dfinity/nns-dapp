import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsStakedMaturityItemActionPo extends BasePageObject {
  private static readonly TID = "sns-staked-maturity-item-action-component";

  static under(element: PageObjectElement): SnsStakedMaturityItemActionPo {
    return new SnsStakedMaturityItemActionPo(
      element.byTestId(SnsStakedMaturityItemActionPo.TID)
    );
  }

  getStakedMaturity(): Promise<string> {
    return this.getText("staked-maturity");
  }
}
