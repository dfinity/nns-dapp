import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { AgeBonusTextPo } from "$tests/page-objects/AgeBonusText.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";

export class SnsNeuronStateItemActionPo extends BasePageObject {
  private static readonly TID = "sns-neuron-state-item-action-component";

  static under(element: PageObjectElement): SnsNeuronStateItemActionPo {
    return new SnsNeuronStateItemActionPo(
      element.byTestId(SnsNeuronStateItemActionPo.TID)
    );
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
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

  hasDisburseButton(): Promise<boolean> {
    return this.getButton("disburse-button").isPresent();
  }

  getDissolveButtonPo(): ButtonPo {
    return this.getButton("sns-dissolve-button");
  }

  getDissolveButtonText(): Promise<string> {
    return this.getDissolveButtonPo().getText();
  }
}
