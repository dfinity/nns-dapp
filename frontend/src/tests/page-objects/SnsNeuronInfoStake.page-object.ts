import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronInfoStakePo extends BasePageObject {
  static readonly tid = "sns-neuron-info-stake";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsNeuronInfoStakePo {
    return new SnsNeuronInfoStakePo(
      element.querySelector(`[data-tid=${SnsNeuronInfoStakePo.tid}]`)
    );
  }

  private getButton(testId: string): ButtonPo {
    return ButtonPo.under({ element: this.root, testId });
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
    return this.getButton("sns-increase-stake");
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
