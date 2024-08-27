import { ConfirmationModalPo } from "$tests/page-objects/ConfirmationModal.page-object";
import { UniversePageSummaryPo } from "$tests/page-objects/UniversePageSummary.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenRemoveConfirmationPo extends BasePageObject {
  private static readonly TID = "import-token-remove-confirmation-component";

  static under(element: PageObjectElement): ImportTokenRemoveConfirmationPo {
    return new ImportTokenRemoveConfirmationPo(
      element.byTestId(ImportTokenRemoveConfirmationPo.TID)
    );
  }

  getConfirmationModalPo(): ConfirmationModalPo {
    return ConfirmationModalPo.under(this.root);
  }

  getUniversePageSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }

  clickConfirm(): Promise<void> {
    return this.getConfirmationModalPo().confirmYes();
  }
}
