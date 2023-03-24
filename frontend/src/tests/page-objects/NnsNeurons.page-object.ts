import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsNeuronCardPo } from "$tests/page-objects/NnsNeuronCard.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronsPo extends BasePageObject {
  static readonly tid = "nns-neurons-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsNeuronsPo {
    return new NnsNeuronsPo(
      element.querySelector(`[data-tid=${NnsNeuronsPo.tid}]`)
    );
  }

  getSkeletonCardPos(): Promise<SkeletonCardPo[]> {
    return SkeletonCardPo.allUnder(this.root);
  }

  getNeuronCardPos(): Promise<NnsNeuronCardPo[]> {
    return NnsNeuronCardPo.allUnder(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && (await this.getSkeletonCardPos()).length === 0
    );
  }

  async getNeuronIds(): Promise<string[]> {
    const cards = await this.getNeuronCardPos();
    return Promise.all(cards.map((card) => card.getNeuronId()));
  }
}
