import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronStateItemActionPo extends BasePageObject {
  private static readonly TID = "nns-neuron-state-item-action-component";

  static under(element: PageObjectElement): NnsNeuronStateItemActionPo {
    return new NnsNeuronStateItemActionPo(
      element.byTestId(NnsNeuronStateItemActionPo.TID)
    );
  }

  getState(): Promise<string> {
    return this.getText("state-text");
  }

  getAgeBonus(): Promise<string> {
    return this.getText("age-bonus-text");
  }

  hasDisburseButton(): Promise<boolean> {
    return this.getButton("disburse-button").isPresent();
  }

  getDissolveButtonText(): Promise<string> {
    return this.getButton("nns-dissolve-action-button").getText();
  }
}
