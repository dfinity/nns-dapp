import { BasePageObject } from "$tests/page-objects/base.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronVisibilityCellPo extends BasePageObject {
  private static readonly BASE_TID = "neuron-visibility-cell-component";
  private readonly neuronId: string;

  constructor(element: PageObjectElement, neuronId: string) {
    super(element);
    this.neuronId = neuronId;
  }

  static under(
    element: PageObjectElement,
    neuronId: string
  ): NeuronVisibilityCellPo {
    const testId = `${NeuronVisibilityCellPo.BASE_TID}-${neuronId}`;
    return new NeuronVisibilityCellPo(element.byTestId(testId), neuronId);
  }

  async getNeuronId(): Promise<string> {
    return this.root.querySelector("[data-tid='neuron-id']").getText();
  }

  async isPublic(): Promise<boolean> {
    return this.root
      .querySelector("[data-tid='public-icon-container']")
      .isPresent();
  }

  getPublicNeuronTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root.byTestId("public-icon-container"));
  }

  async getTags(): Promise<string[]> {
    const tagElements = await this.root.querySelectorAll(
      "[data-tid='neuron-tag']"
    );
    return Promise.all(tagElements.map((el) => el.getText()));
  }

  async getUncontrolledNeuronDetailsText(): Promise<string | null> {
    return await this.root
      .querySelector("[data-tid='uncontrolled-neuron-detail']")
      .getText();
  }
}
