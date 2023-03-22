import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronDetailPo {
  static readonly tid = "sns-neuron-detail-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): SnsNeuronDetailPo | null {
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
