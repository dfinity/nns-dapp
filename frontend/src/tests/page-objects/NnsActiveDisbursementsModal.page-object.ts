import { ActiveDisbursementEntryPo } from "$tests/page-objects/ActiveDisbursementEntry.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";

export class NnsActiveDisbursementsModalPo extends ModalPo {
  private static readonly TID = "nns-active-disbursements-modal";

  static under(element: PageObjectElement): NnsActiveDisbursementsModalPo {
    return new NnsActiveDisbursementsModalPo(
      element.byTestId(NnsActiveDisbursementsModalPo.TID)
    );
  }

  async getTotalMaturity(): Promise<number> {
    return Number(await this.getText("total-maturity"));
  }

  getActiveDisbursementEntryPos(): Promise<ActiveDisbursementEntryPo[]> {
    return ActiveDisbursementEntryPo.allUnder(this.root);
  }

  getCloseButtonPo(): ButtonPo {
    return this.getButton("close-button");
  }
}
