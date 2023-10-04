import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsStakedMaturityItemActionPo extends BasePageObject {
  private static readonly TID = "nns-staked-maturity-item-action-component";

  static under(element: PageObjectElement): NnsStakedMaturityItemActionPo {
    return new NnsStakedMaturityItemActionPo(
      element.byTestId(NnsStakedMaturityItemActionPo.TID)
    );
  }

  getStakedMaturity(): Promise<string> {
    return this.getText("staked-maturity");
  }
}
