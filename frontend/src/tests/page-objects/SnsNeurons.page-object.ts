import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { SnsNeuronCardPo } from "$tests/page-objects/SnsNeuronCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronsPo extends BasePageObject {
  static readonly tid = "sns-neurons-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsNeuronsPo {
    return new SnsNeuronsPo(
      element.querySelector(`[data-tid=${SnsNeuronsPo.tid}]`)
    );
  }

  getSkeletonCardPos(): Promise<SkeletonCardPo[]> {
    return SkeletonCardPo.allUnder(this.root);
  }

  getNeuronCardPos(): Promise<SnsNeuronCardPo[]> {
    return SnsNeuronCardPo.allUnder(this.root);
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
