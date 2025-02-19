import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SaleInProgressModalPo extends ModalPo {
  private static readonly TID = "sale-in-progress-modal";

  static under(element: PageObjectElement): SaleInProgressModalPo {
    return new SaleInProgressModalPo(
      element.byTestId(SaleInProgressModalPo.TID)
    );
  }
}
