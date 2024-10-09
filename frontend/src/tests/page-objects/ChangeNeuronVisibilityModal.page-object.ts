import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ButtonPo } from "./Button.page-object";

export class ChangeNeuronVisibilityModalPo extends ModalPo {
  private static readonly TID = "change-neuron-visibility-modal";

  static under(element: PageObjectElement): ChangeNeuronVisibilityModalPo {
    return new ChangeNeuronVisibilityModalPo(
      element.byTestId(ChangeNeuronVisibilityModalPo.TID)
    );
  }

  getConfirmButton(): ButtonPo {
    return ButtonPo.under({ element: this.root, testId: "confirm-button" });
  }
}
