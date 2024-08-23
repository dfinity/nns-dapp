import { ImportTokenFormPo } from "$tests/page-objects/ImportTokenForm.page-object";
import { ImportTokenReviewPo } from "$tests/page-objects/ImportTokenReview.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenModalPo extends ModalPo {
  private static readonly TID = "import-token-modal-component";

  static under(element: PageObjectElement): ImportTokenModalPo {
    return new ImportTokenModalPo(element.byTestId(ImportTokenModalPo.TID));
  }

  getImportTokenFormPo(): ImportTokenFormPo {
    return ImportTokenFormPo.under(this.root);
  }

  getImportTokenReviewPo(): ImportTokenReviewPo {
    return ImportTokenReviewPo.under(this.root);
  }
}
