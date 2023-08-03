import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronInfoStakePo extends BasePageObject {
  private static readonly TID = "sns-neuron-info-stake";

  static under(element: PageObjectElement): SnsNeuronInfoStakePo {
    return new SnsNeuronInfoStakePo(element.byTestId(SnsNeuronInfoStakePo.TID));
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  isContentLoaded(): Promise<boolean> {
    return this.getAmountDisplayPo().isPresent();
  }

  getStakeAmount(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }

  getDisburseButtonPo(): ButtonPo {
    return this.getButton("disburse-button");
  }

  hasDisburseButton(): Promise<boolean> {
    return this.getDisburseButtonPo().isPresent();
  }

  getIncreaseDissolveDelayButtonPo(): ButtonPo {
    return this.getButton("sns-increase-dissolve-delay");
  }

  hasIncreaseDissolveDelayButton(): Promise<boolean> {
    return this.getIncreaseDissolveDelayButtonPo().isPresent();
  }

  getIncreaseStakeButtonPo(): ButtonPo {
    return this.getButton("increase-stake-button-component");
  }

  hasIncreaseStakeButton(): Promise<boolean> {
    return this.getIncreaseStakeButtonPo().isPresent();
  }

  getDissolveButtonPo(): ButtonPo {
    return this.getButton("sns-dissolve-button");
  }

  hasDissolveButton(): Promise<boolean> {
    return this.getDissolveButtonPo().isPresent();
  }
}
