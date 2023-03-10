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

  getSkeletonCardPos(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  getNeuronCardPos(): NnsNeuronCardPo[] {
    return NnsNeuronCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCardPos().length === 0;
  }

  getNeuronIds(): string[] {
    const cards = this.getNeuronCardPos();
    return cards.map((card) => card.getNeuronId());
  }
}
