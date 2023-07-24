import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronPageHeadingPo extends BasePageObject {
  private static readonly TID = "sns-neuron-page-heading-component";

  static under(element: PageObjectElement): SnsNeuronPageHeadingPo {
    return new SnsNeuronPageHeadingPo(
      element.byTestId(SnsNeuronPageHeadingPo.TID)
    );
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  getStake(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }

  getVotingPower(): Promise<string> {
    return this.getText("voting-power");
  }
}
