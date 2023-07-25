import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";

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

  getDissolveButtonPo(): ButtonPo {
    return this.getButton("nns-dissolve-action-button");
  }

  getDissolveButtonText(): Promise<string> {
    return this.getButton("nns-dissolve-action-button").getText();
  }
}
