import { NeuronCardContainerPo } from "$tests/page-objects/NeuronCardContainer.page-object";
import { NnsNeuronCardTitlePo } from "$tests/page-objects/NnsNeuronCardTitle.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronCardPo extends BasePageObject {
  private static readonly TID = "nns-neuron-card-component";

  static under(element: PageObjectElement): NnsNeuronCardPo {
    return new NnsNeuronCardPo(element.byTestId(NnsNeuronCardPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<NnsNeuronCardPo[]> {
    return Array.from(await element.allByTestId(NnsNeuronCardPo.TID)).map(
      (el) => new NnsNeuronCardPo(el)
    );
  }

  getCardTitlePo(): NnsNeuronCardTitlePo {
    return NnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronCardContainerPo(): NeuronCardContainerPo {
    return NeuronCardContainerPo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getCardTitlePo().getNeuronId();
  }

  click(): Promise<void> {
    return this.getNeuronCardContainerPo().click();
  }

  isSelected(): Promise<boolean> {
    return this.getNeuronCardContainerPo().isSelected();
  }

  isDisabled(): Promise<boolean> {
    return this.getNeuronCardContainerPo().isDisabled();
  }

  async getBalance(): Promise<number> {
    return Number(await this.getText("token-value"));
  }

  getNeuronTags(): Promise<string[]> {
    return this.getCardTitlePo().getNeuronTags();
  }
}
