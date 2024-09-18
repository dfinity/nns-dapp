import { ConfirmationModalPo } from "$tests/page-objects/ConfirmationModal.page-object";
import { UniverseSummaryPo } from "$tests/page-objects/UniverseSummary.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenRemoveConfirmationPo extends ConfirmationModalPo {
  private static readonly TID = "import-token-remove-confirmation-component";

  static under(element: PageObjectElement): ImportTokenRemoveConfirmationPo {
    return new ImportTokenRemoveConfirmationPo(
      element.byTestId(ImportTokenRemoveConfirmationPo.TID)
    );
  }

  getUniverseSummaryPo(): UniverseSummaryPo {
    return UniverseSummaryPo.under(this.root);
  }

  getLedgerCanisterId(): Promise<string> {
    return this.getText("ledger-canister-id");
  }
}
