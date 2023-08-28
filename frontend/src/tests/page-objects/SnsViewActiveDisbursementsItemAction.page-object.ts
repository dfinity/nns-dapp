import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsViewActiveDisbursementsItemActionPo extends BasePageObject {
  private static readonly TID =
    "sns-view-active-disbursements-item-action-component";

  static under(
    element: PageObjectElement
  ): SnsViewActiveDisbursementsItemActionPo {
    return new SnsViewActiveDisbursementsItemActionPo(
      element.byTestId(SnsViewActiveDisbursementsItemActionPo.TID)
    );
  }

  async getDisbursementCount(): Promise<number> {
    return Number.parseInt(
      (await this.root.byTestId("disbursement-count").getText()).trim(),
      10
    );
  }
}
