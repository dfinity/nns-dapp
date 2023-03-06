import { SkeletonCardPo } from "./SkeletonCard.page-object";

const tid = "nns-neuron-detail-component";

export class NnsNeuronDetailPo {
  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== tid) {
      throw new Error(`${root} is not an NnsNeuronDetail`);
    }
    this.root = root;
  }

  static under(element: Element): NnsNeuronDetailPo | null {
    const el = element.querySelector(`[data-tid=${tid}]`);
    return el && new NnsNeuronDetailPo(el);
  }

  getSkeletonCards(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCards().length === 0;
  }
}
