import { nonNullish } from "@dfinity/utils";
import { Button } from "./Button.page-object";

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

  isContentLoaded() {
    return nonNullish(this.root.querySelector(`[data-tid=sns-neuron-stake]`));
  }

  getDisburseButton() {
    return Button.under({ element: this.root, testId: "disburse-button" });
  }

  hasDisburseButton() {
    return nonNullish(this.getDisburseButton());
  }

  getIncreaseDissolveDelayButton() {
    return Button.under({
      element: this.root,
      testId: "sns-increase-dissolve-delay",
    });
  }

  hasIncreaseDissolveDelayButton() {
    return nonNullish(this.getIncreaseDissolveDelayButton());
  }

  getIncreaseStakeButton() {
    return Button.under({
      element: this.root,
      testId: "sns-increase-stake",
    });
  }

  hasIncreaseStakeButton() {
    return nonNullish(this.getIncreaseStakeButton());
  }

  getDissolveButton() {
    return Button.under({
      element: this.root,
      testId: "sns-dissolve-button",
    });
  }

  hasDissolveButton() {
    return nonNullish(this.getDissolveButton());
  }
}
