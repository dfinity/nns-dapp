import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NewFolloweeModalPo extends ModalPo {
  private static readonly TID = "new-followee-modal-component";

  static under(element: PageObjectElement): NewFolloweeModalPo {
    return new NewFolloweeModalPo(element.byTestId(NewFolloweeModalPo.TID));
  }

  getTextInputPo(): TextInputPo {
    return TextInputPo.under({ element: this.root });
  }

  async followNeuronId(neuronId: string): Promise<void> {
    await this.getTextInputPo().typeText(neuronId);
    await this.click("follow-neuron-button");
    await this.waitForClosed();
  }
}
