import { ActiveDisbursementEntryPo } from "$tests/page-objects/ActiveDisbursementEntry.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsActiveDisbursementsModalPo extends ModalPo {
  private static readonly TID = "sns-active-disbursements-modal";

  static under(element: PageObjectElement): SnsActiveDisbursementsModalPo {
    return new SnsActiveDisbursementsModalPo(
      element.byTestId(SnsActiveDisbursementsModalPo.TID)
    );
  }

  async getTotalMaturity(): Promise<number> {
    return Number(await this.getText("total-maturity"));
  }

  getActiveDisbursementEntryPos(): Promise<ActiveDisbursementEntryPo[]> {
    return ActiveDisbursementEntryPo.allUnder(this.root);
  }
}
