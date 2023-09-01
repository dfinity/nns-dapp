import { ActiveDisbursementEntryPo } from "$tests/page-objects/ActiveDisbursementEntry.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsActiveDisbursementsModalPo extends BasePageObject {
  private static readonly TID = "sns-active-disbursements-modal";

  static under(element: PageObjectElement): SnsActiveDisbursementsModalPo {
    return new SnsActiveDisbursementsModalPo(
      element.byTestId(SnsActiveDisbursementsModalPo.TID)
    );
  }

  getActiveDisbursementEntryPos(): Promise<ActiveDisbursementEntryPo[]> {
    return ActiveDisbursementEntryPo.allUnder(this.root);
  }
}
