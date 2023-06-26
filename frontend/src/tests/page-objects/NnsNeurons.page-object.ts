import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsNeuronCardPo } from "$tests/page-objects/NnsNeuronCard.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronsPo extends BasePageObject {
  private static readonly TID = "nns-neurons-component";

  static under(element: PageObjectElement): NnsNeuronsPo {
    return new NnsNeuronsPo(element.byTestId(NnsNeuronsPo.TID));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  getNeuronCardPos(): Promise<NnsNeuronCardPo[]> {
    return NnsNeuronCardPo.allUnder(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && !(await this.getSkeletonCardPo().isPresent())
    );
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
  }

  async getNeuronIds(): Promise<string[]> {
    const cards = await this.getNeuronCardPos();
    return Promise.all(cards.map((card) => card.getNeuronId()));
  }

  async getNeuronCardPo(neuronId: string): Promise<NnsNeuronCardPo> {
    const neuronCards = await this.getNeuronCardPos();

    for (const neuronCard of neuronCards) {
      const id = await neuronCard.getNeuronId();
      if (id === neuronId) {
        return neuronCard;
      }
    }

    throw new Error(`Neuron card with id ${neuronId} not found`);
  }
}
