import { NnsNeuronCardPo } from "$tests/page-objects/NnsNeuronCard.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronsPo {
  static readonly tid = "nns-neurons-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): NnsNeuronsPo | null {
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
