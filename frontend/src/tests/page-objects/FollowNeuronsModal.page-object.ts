import { EditFollowNeuronsPo } from "$tests/page-objects/EditFollowNeurons.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNeuronsModalPo extends ModalPo {
  private static readonly TID = "follow-neurons-modal-component";

  static under(element: PageObjectElement): FollowNeuronsModalPo | null {
    return new FollowNeuronsModalPo(element.byTestId(FollowNeuronsModalPo.TID));
  }

  getEditFollowNeuronsPo(): EditFollowNeuronsPo {
    return EditFollowNeuronsPo.under(this.root);
  }

  clickCloseButton(): Promise<void> {
    return this.click("close-button");
  }
}
