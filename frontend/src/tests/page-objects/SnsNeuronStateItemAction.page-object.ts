import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronStateItemActionPo extends BasePageObject {
  private static readonly TID = "sns-neuron-state-item-action-component";

  static under(element: PageObjectElement): SnsNeuronStateItemActionPo {
    return new SnsNeuronStateItemActionPo(
      element.byTestId(SnsNeuronStateItemActionPo.TID)
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
    return this.getButton("sns-dissolve-button").getText();
  }
}
