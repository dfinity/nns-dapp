import { ConfirmationModalPo } from "$tests/page-objects/ConfirmationModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DissolveActionButtonModalPo extends ConfirmationModalPo {
  private static TID = "dissolve-action-button-modal-component";

  static under(element: PageObjectElement): DissolveActionButtonModalPo {
    return new DissolveActionButtonModalPo(
      element.byTestId(DissolveActionButtonModalPo.TID)
    );
  }
}
