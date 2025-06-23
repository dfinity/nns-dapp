import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ViewActiveDisbursementsItemActionPo extends BasePageObject {
  private static readonly TID =
    "view-active-disbursements-item-action-component";

  static under(
    element: PageObjectElement
  ): ViewActiveDisbursementsItemActionPo {
    return new ViewActiveDisbursementsItemActionPo(
      element.byTestId(ViewActiveDisbursementsItemActionPo.TID)
    );
  }

  async getDisbursementTotal(): Promise<string> {
    return (await this.root.byTestId("disbursement-total").getText()).trim();
  }
}
