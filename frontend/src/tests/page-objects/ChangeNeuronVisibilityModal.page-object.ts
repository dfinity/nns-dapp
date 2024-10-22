import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";
import { ChangeBulkNeuronVisibilityFormPo } from "./ChangeBulkNeuronVisibilityForm.page-object";

export class ChangeNeuronVisibilityModalPo extends ModalPo {
  private static readonly TID = "change-neuron-visibility-modal";

  static under(element: PageObjectElement): ChangeNeuronVisibilityModalPo {
    return new ChangeNeuronVisibilityModalPo(
      element.byTestId(ChangeNeuronVisibilityModalPo.TID)
    );
  }

  getChangeBulkNeuronVisibilityFormPo(): ChangeBulkNeuronVisibilityFormPo {
    return ChangeBulkNeuronVisibilityFormPo.under(this.root);
  }

  getConfirmButton(): ButtonPo {
    return this.getChangeBulkNeuronVisibilityFormPo().getConfirmButton();
  }
}
