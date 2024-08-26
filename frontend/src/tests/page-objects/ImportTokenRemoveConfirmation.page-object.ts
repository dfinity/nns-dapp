import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { UniversePageSummaryPo } from "$tests/page-objects/UniversePageSummary.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenRemoveConfirmationPo extends ModalPo {
  private static readonly TID = "import-token-remove-confirmation-component";

  static under(element: PageObjectElement): ImportTokenRemoveConfirmationPo {
    return new ImportTokenRemoveConfirmationPo(
      element.byTestId(ImportTokenRemoveConfirmationPo.TID)
    );
  }

  getUniversePageSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }

  clickClose(): Promise<void> {
    return this.getButton("close-button").click();
  }

  clickConfirm(): Promise<void> {
    return this.getButton("confirm-button").click();
  }
}
