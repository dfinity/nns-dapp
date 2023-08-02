import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsAvailableMaturityItemActionPo extends BasePageObject {
  private static readonly TID = "sns-available-maturity-item-action-component";

  static under(element: PageObjectElement): SnsAvailableMaturityItemActionPo {
    return new SnsAvailableMaturityItemActionPo(
      element.byTestId(SnsAvailableMaturityItemActionPo.TID)
    );
  }

  getMaturity(): Promise<string> {
    return this.getText("available-maturity");
  }

  hasStakeButton(): Promise<boolean> {
    return this.getButton("stake-maturity-button").isPresent();
  }
}
