import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { MakeNeuronsPublicFormPo } from "./MakeNeuronsPublicForm.page-object";

export class MakeNeuronsPublicModalPo extends ModalPo {
  private static readonly TID = "make-neurons-public-modal-component";

  static under(element: PageObjectElement): MakeNeuronsPublicModalPo {
    return new MakeNeuronsPublicModalPo(
      element.byTestId(MakeNeuronsPublicModalPo.TID)
    );
  }

  getMakeNeuronsPublicFormPo(): MakeNeuronsPublicFormPo {
    return MakeNeuronsPublicFormPo.under(this.root);
  }
}
