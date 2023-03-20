import { NnsNeuronCardTitlePo } from "./NnsNeuronCardTitle.page-object";

export class NnsNeuronCardPo {
  static readonly tid = "nns-neuron-card-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== NnsNeuronCardPo.tid) {
      throw new Error(`${root} is not an NnsNeuronCard`);
    }
    this.root = root;
  }

  static allUnder(element: Element): NnsNeuronCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${NnsNeuronCardPo.tid}]`)
    ).map((el) => new NnsNeuronCardPo(el));
  }

  getCardTitlePo(): NnsNeuronCardTitlePo {
    return NnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): string {
    return this.getCardTitlePo().getNeuronId();
  }
}
