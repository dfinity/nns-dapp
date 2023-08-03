import type { PageObjectElement } from "$tests/types/page-object.types";
import { CommonItemActionPo } from "./CommonItemAction.page-object";
import { DissolveDelayBonusTextPo } from "./DissolveDelayBonusText.page-object";

export class SnsNeuronDissolveDelayItemActionPo extends CommonItemActionPo {
  private static readonly TID =
    "sns-neuron-dissolve-delay-item-action-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): SnsNeuronDissolveDelayItemActionPo {
    return new SnsNeuronDissolveDelayItemActionPo(
      element.byTestId(SnsNeuronDissolveDelayItemActionPo.TID)
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
    return this.getButton("sns-increase-dissolve-delay").isPresent();
  }
}
