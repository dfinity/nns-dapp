import { SkeletonCardPo } from "./SkeletonCard.page-object";

export class NnsNeuronDetailPo {
  static readonly tid = "nns-neuron-detail-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== NnsNeuronDetailPo.tid) {
      throw new Error(`${root} is not an NnsNeuronDetail`);
    }
    this.root = root;
  }

  static under(element: Element): NnsNeuronDetailPo | null {
    const el = element.querySelector(`[data-tid=${NnsNeuronDetailPo.tid}]`);
    return el && new NnsNeuronDetailPo(el);
  }

  getSkeletonCardPos(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCardPos().length === 0;
  }
}
