import { SkeletonCardPo } from "./SkeletonCard.page-object";
import { SnsNeuronCardPo } from "./SnsNeuronCard.page-object";

export class SnsNeuronsPo {
  static readonly tid = "sns-neurons-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== SnsNeuronsPo.tid) {
      throw new Error(`${root} is not an SnsNeurons`);
    }
    this.root = root;
  }

  static under(element: Element): SnsNeuronsPo | null {
    const el = element.querySelector(`[data-tid=${SnsNeuronsPo.tid}]`);
    return el && new SnsNeuronsPo(el);
  }

  getSkeletonCards(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  getNeuronCards(): SnsNeuronCardPo[] {
    return SnsNeuronCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCards().length === 0;
  }

  getNeuronIds(): string[] {
    const cards = this.getNeuronCards();
    return cards.map((card) => card.getNeuronId());
  }
}
