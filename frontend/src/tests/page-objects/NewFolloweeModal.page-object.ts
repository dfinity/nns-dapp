import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NewFolloweeModalPo extends BasePageObject {
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
  }
}
