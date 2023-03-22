export class NnsNeuronCardTitlePo {
  static readonly tid = "neuron-card-title";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): NnsNeuronCardTitlePo | null {
    const el = element.querySelector(`[data-tid=${NnsNeuronCardTitlePo.tid}]`);
    return el && new NnsNeuronCardTitlePo(el);
  }

  getNeuronId(): string {
    return this.root.querySelector("[data-tid=neuron-id]").textContent;
  }
}
