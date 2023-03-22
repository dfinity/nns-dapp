import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { SnsNeuronCardPo } from "$tests/page-objects/SnsNeuronCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronsPo {
  static readonly tid = "sns-neurons-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
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

  getNeuronIds(): string[] {
    const cards = this.getNeuronCardPos();
    return cards.map((card) => card.getNeuronId());
  }
}
