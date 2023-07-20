import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronDissolveDelayActionItemPo extends BasePageObject {
  private static readonly TID =
    "nns-neuron-dissolve-delay-item-action-component";

  static under(element: PageObjectElement): NnsNeuronDissolveDelayActionItemPo {
    return new NnsNeuronDissolveDelayActionItemPo(
      element.byTestId(NnsNeuronDissolveDelayActionItemPo.TID)
    );
  }

  getDissolveState(): Promise<string> {
    return this.getText("dissolve-delay-text");
  }

  getDissolveBonus(): Promise<string> {
    return this.getText("dissolve-bonus-text");
  }

  hasIncreaseDissolveDelayButton(): Promise<boolean> {
    return this.getButton(
      "increase-dissolve-delay-button-component"
    ).isPresent();
  }
}
