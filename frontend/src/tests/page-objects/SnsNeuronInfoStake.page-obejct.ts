import { nonNullish } from "@dfinity/utils";
import { AmountDisplayPo } from "./AmountDisplay.page-object";
import { ButtonPo } from "./Button.page-object";

export class SnsNeuronInfoStakePo {
  static readonly tid = "sns-neuron-info-stake";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== SnsNeuronInfoStakePo.tid) {
      throw new Error(`${root} is not an SnsNeuronInfoStakePo`);
    }
    this.root = root;
  }

  static under(element: Element): SnsNeuronInfoStakePo | null {
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
