import type { PageObjectElement } from "$tests/types/page-object.types";
import { AgeBonusTextPo } from "./AgeBonusText.page-object";
import type { ButtonPo } from "./Button.page-object";
import { CommonItemActionPo } from "./CommonItemAction.page-object";

export class NnsNeuronStateItemActionPo extends CommonItemActionPo {
  private static readonly TID = "nns-neuron-state-item-action-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): NnsNeuronStateItemActionPo {
    return new NnsNeuronStateItemActionPo(
      element.byTestId(NnsNeuronStateItemActionPo.TID)
    );
  }

  getState(): Promise<string> {
    return this.getText("state-text");
  }

  getAgeBonusTextPo(): AgeBonusTextPo {
    return AgeBonusTextPo.under(this.root);
  }

  async getAgeBonus(): Promise<string> {
    return (await this.getAgeBonusTextPo().isPresent())
      ? this.getAgeBonusTextPo().getText()
      : this.root.byTestId("age-bonus-text").getText();
  }

  getDisburseButtonPo(): ButtonPo {
    return this.getButton("disburse-button");
  }

  hasDisburseButton(): Promise<boolean> {
    return this.getDisburseButtonPo().isPresent();
  }

  getDissolveButtonPo(): ButtonPo {
    return this.getButton("nns-dissolve-action-button");
  }

  getDissolveButtonText(): Promise<string> {
    return this.getButton("nns-dissolve-action-button").getText();
  }

  clickDisburse(): Promise<void> {
    return this.getDisburseButtonPo().click();
  }
}
