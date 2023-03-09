import { NnsNeuronCardPo } from "./NnsNeuronCard.page-object";
import { SkeletonCardPo } from "./SkeletonCard.page-object";

export class NnsNeuronsPo {
  static readonly tid = "nns-neurons-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== NnsNeuronsPo.tid) {
      throw new Error(`${root} is not an NnsNeurons`);
    }
    this.root = root;
  }

  static under(element: Element): NnsNeuronsPo | null {
    const el = element.querySelector(`[data-tid=${NnsNeuronsPo.tid}]`);
    return el && new NnsNeuronsPo(el);
  }

  getSkeletonCards(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  getNeuronCards(): NnsNeuronCardPo[] {
    return NnsNeuronCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCards().length === 0;
  }

  getNeuronIds(): string[] {
    const cards = this.getNeuronCards();
    return cards.map((card) => card.getNeuronId());
  }
}
