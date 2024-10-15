import { BasePageObject } from "$tests/page-objects/base.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronVisibilityRowPo extends BasePageObject {
  private static readonly BASE_TID = "neuron-visibility-row-component";
  private readonly neuronId: string;

  constructor({
    element,
    neuronId,
  }: {
    element: PageObjectElement;
    neuronId: string;
  }) {
    super(element);
    this.neuronId = neuronId;
  }

  static under({
    element,
    neuronId,
  }: {
    element: PageObjectElement;
    neuronId: string;
  }): NeuronVisibilityRowPo {
    const testId = `${NeuronVisibilityRowPo.BASE_TID}-${neuronId}`;
    return new NeuronVisibilityRowPo({
      element: element.byTestId(testId),
      neuronId,
    });
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
