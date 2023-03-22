import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { SnsNeuronCardPo } from "$tests/page-objects/SnsNeuronCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronsPo extends BasePageObject {
  static readonly tid = "sns-neurons-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsNeuronsPo | null {
    const el = element.querySelector(`[data-tid=${SnsNeuronsPo.tid}]`);
    return el && new SnsNeuronsPo(el);
  }

  getSkeletonCardPos(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  getNeuronCardPos(): SnsNeuronCardPo[] {
    return SnsNeuronCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCardPos().length === 0;
  }

  getNeuronIds(): Promise<string[]> {
    const cards = this.getNeuronCardPos();
    return Promise.all(cards.map((card) => card.getNeuronId()));
  }
}
