import type { PageObjectElement } from "$tests/types/page-object.types";
import { CommonItemActionPo } from "./CommonItemAction.page-object";
import { DissolveDelayBonusTextPo } from "./DissolveDelayBonusText.page-object";

export class NnsNeuronDissolveDelayItemActionPo extends CommonItemActionPo {
  private static readonly TID =
    "nns-neuron-dissolve-delay-item-action-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): NnsNeuronDissolveDelayItemActionPo {
    return new NnsNeuronDissolveDelayItemActionPo(
      element.byTestId(NnsNeuronDissolveDelayItemActionPo.TID)
    );
  }

  getDissolveDelayBonusTextPo(): DissolveDelayBonusTextPo {
    return DissolveDelayBonusTextPo.under(this.root);
  }

  async getDissolveBonus(): Promise<string> {
    return (await this.getDissolveDelayBonusTextPo().isPresent())
      ? this.getDissolveDelayBonusTextPo().getText()
      : this.root.byTestId("dissolve-bonus-text").getText();
  }

  hasIncreaseDissolveDelayButton(): Promise<boolean> {
    return this.getButton(
      "increase-dissolve-delay-button-component"
    ).isPresent();
  }
}
