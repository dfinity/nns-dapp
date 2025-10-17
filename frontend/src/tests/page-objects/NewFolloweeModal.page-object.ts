import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { KnownNeuronFollowItemPo } from "$tests/page-objects/KnownNeuronFollowItem.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NewFolloweeModalPo extends ModalPo {
  private static readonly TID = "new-followee-modal-component";

  static under(element: PageObjectElement): NewFolloweeModalPo {
    return new NewFolloweeModalPo(element.byTestId(NewFolloweeModalPo.TID));
  }

  getTextInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({ element: this.root });
  }

  getCustomErrorMessagePo(): PageObjectElement | null {
    return this.root.byTestId("custom-error-message");
  }

  getKnownNeuronItemPos(): Promise<KnownNeuronFollowItemPo[]> {
    return KnownNeuronFollowItemPo.allUnder(this.root);
  }

  async followNeuronId(neuronId: string): Promise<void> {
    await this.getTextInputPo().typeText(neuronId);
    await this.click("follow-neuron-button");
  }
}
