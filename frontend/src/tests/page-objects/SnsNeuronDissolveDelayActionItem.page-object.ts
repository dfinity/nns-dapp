import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronDissolveDelayActionItemPo extends BasePageObject {
  private static readonly TID =
    "sns-neuron-dissolve-delay-item-action-component";

  static under(element: PageObjectElement): SnsNeuronDissolveDelayActionItemPo {
    return new SnsNeuronDissolveDelayActionItemPo(
      element.byTestId(SnsNeuronDissolveDelayActionItemPo.TID)
    );
  }

  getDissolveState(): Promise<string> {
    return this.getText("dissolve-delay-text");
  }

  getDissolveBonus(): Promise<string> {
    return this.getText("dissolve-bonus-text");
  }

  hasIncreaseDissolveDelayButton(): Promise<boolean> {
    return this.getButton("sns-increase-dissolve-delay").isPresent();
  }
}
