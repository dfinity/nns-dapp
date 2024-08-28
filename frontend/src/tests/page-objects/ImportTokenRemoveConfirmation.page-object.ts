import { ConfirmationModalPo } from "$tests/page-objects/ConfirmationModal.page-object";
import { UniversePageSummaryPo } from "$tests/page-objects/UniversePageSummary.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenRemoveConfirmationPo extends ConfirmationModalPo {
  private static readonly TID = "import-token-remove-confirmation-component";

  static under(element: PageObjectElement): ImportTokenRemoveConfirmationPo {
    return new ImportTokenRemoveConfirmationPo(
      element.byTestId(ImportTokenRemoveConfirmationPo.TID)
    );
  }

  getUniversePageSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }
}
