import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { NnsNeuronCardPo } from "$tests/page-objects/NnsNeuronCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectNeuronsToMergePo extends BasePageObject {
  static readonly TID = "select-neurons-to-merge-component";

  static under(element: PageObjectElement): SelectNeuronsToMergePo {
    return new SelectNeuronsToMergePo(
      element.byTestId(SelectNeuronsToMergePo.TID)
    );
  }

  getNnsNeuronCardPos(): Promise<NnsNeuronCardPo[]> {
    return NnsNeuronCardPo.allUnder(this.root);
  }

  async getNnsNeuronCardPo(neuronId: string): Promise<NnsNeuronCardPo> {
    const neuronCards = await this.getNnsNeuronCardPos();

    for (const neuronCard of neuronCards) {
      const id = await neuronCard.getNeuronId();
      if (id === neuronId) {
        return neuronCard;
      }
    }

    throw new Error(`Neuron card with id ${neuronId} not found`);
  }

  getConfirmSelectionButtonPo(): ButtonPo {
    return this.getButton("merge-neurons-confirm-selection-button");
  }

  async selectNeuron(neuronId: string): Promise<void> {
    const card = await this.getNnsNeuronCardPo(neuronId);
    if (await card.isSelected()) {
      throw new Error(`Neuron card with id ${neuronId} is already selected.`);
    }
    await card.click();
  }

  async selectNeurons({
    sourceNeurondId,
    targetNeuronId,
  }: {
    sourceNeurondId: string;
    targetNeuronId: string;
  }): Promise<void> {
    await this.selectNeuron(sourceNeurondId);
    await this.selectNeuron(targetNeuronId);
    await this.getConfirmSelectionButtonPo().click();
  }
}
