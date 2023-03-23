import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { nonNullish } from "@dfinity/utils";

export class SnsNeuronInfoStakePo extends BasePageObject {
  static readonly tid = "sns-neuron-info-stake";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsNeuronInfoStakePo | null {
    const el = element.querySelector(`[data-tid=${SnsNeuronInfoStakePo.tid}]`);
    return el && new SnsNeuronInfoStakePo(el);
  }

  private getButton(testId: string): ButtonPo | null {
    return ButtonPo.under({ element: this.root, testId });
  }

  isContentLoaded() {
    return nonNullish(this.getStakeAmount());
  }

  getStakeAmount() {
    return AmountDisplayPo.under(this.root)?.getAmount();
  }

  getDisburseButtonPo() {
    return this.getButton("disburse-button");
  }

  hasDisburseButton() {
    return nonNullish(this.getDisburseButtonPo());
  }

  getIncreaseDissolveDelayButtonPo() {
    return this.getButton("sns-increase-dissolve-delay");
  }

  hasIncreaseDissolveDelayButton() {
    return nonNullish(this.getIncreaseDissolveDelayButtonPo());
  }

  getIncreaseStakeButtonPo() {
    return this.getButton("sns-increase-stake");
  }

  hasIncreaseStakeButton() {
    return nonNullish(this.getIncreaseStakeButtonPo());
  }

  getDissolveButtonPo() {
    return this.getButton("sns-dissolve-button");
  }

  hasDissolveButton() {
    return nonNullish(this.getDissolveButtonPo());
  }
}
