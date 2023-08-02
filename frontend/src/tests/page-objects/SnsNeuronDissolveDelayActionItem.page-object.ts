import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { DissolveDelayBonusTextPo } from "./DissolveDelayBonusText.page-object";

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
