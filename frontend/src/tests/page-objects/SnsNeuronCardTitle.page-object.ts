import { HashPo } from "./Hash.page-object";

export class SnsNeuronCardTitlePo {
  static readonly tid = "sns-neuron-card-title";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): SnsNeuronCardTitlePo | null {
    const el = element.querySelector(`[data-tid=${SnsNeuronCardTitlePo.tid}]`);
    return el && new SnsNeuronCardTitlePo(el);
  }

  getNeuronId(): string {
    return HashPo.under(
      this.root.querySelector("[data-tid=neuron-id-container]")
    ).getText();
  }
}
