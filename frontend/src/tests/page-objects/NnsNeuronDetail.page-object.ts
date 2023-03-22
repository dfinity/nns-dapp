import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronDetailPo extends BasePageObject {
  static readonly tid = "nns-neuron-detail-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsNeuronDetailPo | null {
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
