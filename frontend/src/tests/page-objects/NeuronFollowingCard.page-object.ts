import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronFollowingCardPo extends BasePageObject {
  private static readonly TID = "neuron-following-card--component";

  static under(element: PageObjectElement): NeuronFollowingCardPo {
    return new NeuronFollowingCardPo(
      element.byTestId(NeuronFollowingCardPo.TID)
    );
  }

  getFollowNeuronsButtonPo(): ButtonPo {
    return this.getButton("follow-neurons-button-component");
  }
}
