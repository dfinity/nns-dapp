import { ImportTokenFormPo } from "$tests/page-objects/ImportTokenForm.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddIndexCanisterModalPo extends ModalPo {
  private static readonly TID = "add-index-canister-modal-component";

  static under(element: PageObjectElement): AddIndexCanisterModalPo {
    return new AddIndexCanisterModalPo(
      element.byTestId(AddIndexCanisterModalPo.TID)
    );
  }

  getImportTokenFormPo(): ImportTokenFormPo {
    return ImportTokenFormPo.under(this.root);
  }

  typeIndexCanisterId(indexCanisterId: string): Promise<void> {
    return this.getImportTokenFormPo()
      .getIndexCanisterInputPo()
      .typeText(indexCanisterId);
  }

  clickAddIndexCanisterButton(): Promise<void> {
    return this.getImportTokenFormPo().getSubmitButtonPo().click();
  }
}
