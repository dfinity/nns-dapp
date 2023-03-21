import { SkeletonCardPo } from "./SkeletonCard.page-object";

export class SnsNeuronDetailPo {
  static readonly tid = "sns-neuron-detail-component";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): SnsNeuronDetailPo | null {
    const el = element.querySelector(`[data-tid=${SnsNeuronDetailPo.tid}]`);
    return el && new SnsNeuronDetailPo(el);
  }

  getSkeletonCardPos(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCardPos().length === 0;
  }
}
