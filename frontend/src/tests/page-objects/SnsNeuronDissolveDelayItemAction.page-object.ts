import { DissolveDelayBonusTextPo } from "$tests/page-objects/DissolveDelayBonusText.page-object";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronDissolveDelayItemActionPo extends BasePageObject {
  private static readonly TID =
    "sns-neuron-dissolve-delay-item-action-component";

  static under(element: PageObjectElement): SnsNeuronDissolveDelayItemActionPo {
    return new SnsNeuronDissolveDelayItemActionPo(
      element.byTestId(SnsNeuronDissolveDelayItemActionPo.TID)
    );
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
  }

  getDissolveState(): Promise<string> {
    return this.getText("dissolve-delay-text");
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
