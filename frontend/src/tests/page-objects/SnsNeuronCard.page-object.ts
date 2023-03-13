import { SnsNeuronCardTitlePo } from "./SnsNeuronCardTitle.page-object";

export class SnsNeuronCardPo {
  static readonly tid = "sns-neuron-card-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== SnsNeuronCardPo.tid) {
      throw new Error(`${root} is not an SnsNeuronCard`);
    }
    this.root = root;
  }

  static allUnder(element: Element): SnsNeuronCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${SnsNeuronCardPo.tid}]`)
    ).map((el) => new SnsNeuronCardPo(el));
  }

  getCardTitlePo(): SnsNeuronCardTitlePo {
    return SnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): string {
    return this.getCardTitlePo().getNeuronId();
  }
}
