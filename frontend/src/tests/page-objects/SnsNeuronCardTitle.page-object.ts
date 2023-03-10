import { HashPo } from "./Hash.page-object";

export class SnsNeuronCardTitlePo {
  static readonly tid = "sns-neuron-card-title";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== SnsNeuronCardTitlePo.tid) {
      throw new Error(`${root} is not an SnsNeuronCardTitle`);
    }
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
