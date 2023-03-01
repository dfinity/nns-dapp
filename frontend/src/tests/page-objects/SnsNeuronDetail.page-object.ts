import { SkeletonCardPo } from "./SkeletonCard.page-object";

const tid = "sns-neuron-detail-component";

export class SnsNeuronDetailPo {
  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== tid) {
      throw new Error(`${root} is not an SnsNeuronDetail`);
    }
    this.root = root;
  }

  static under(element: Element): SnsNeuronDetailPo | null {
    const el = element.querySelector(`[data-tid=${tid}]`);
    return el && new SnsNeuronDetailPo(el);
  }

  getSkeletonCards(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCards().length == 0;
  }
}
