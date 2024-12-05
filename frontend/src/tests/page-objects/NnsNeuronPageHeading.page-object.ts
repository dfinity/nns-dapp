import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { NeuronTagPo } from "./NeuronTag.page-object";

export class NnsNeuronPageHeadingPo extends BasePageObject {
  private static readonly TID = "nns-neuron-page-heading-component";

  static under(element: PageObjectElement): NnsNeuronPageHeadingPo {
    return new NnsNeuronPageHeadingPo(
      element.byTestId(NnsNeuronPageHeadingPo.TID)
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

  async getNeuronTags(): Promise<string[]> {
    const elements = await NeuronTagPo.allUnder(this.root);
    return Promise.all(elements.map((tag) => tag.getText()));
  }
}
