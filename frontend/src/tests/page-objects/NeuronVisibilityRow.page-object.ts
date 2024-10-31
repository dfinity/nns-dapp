import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronVisibilityRowPo extends BasePageObject {
  private static readonly BASE_TID = "neuron-visibility-row-component";

  static under({
    element,
    neuronId,
  }: {
    element: PageObjectElement;
    neuronId: string;
  }): NeuronVisibilityRowPo {
    const testId = `${NeuronVisibilityRowPo.BASE_TID}-${neuronId}`;
    return new NeuronVisibilityRowPo(element.byTestId(testId));
  }

  getNeuronId(): Promise<string> {
    return this.getText("neuron-id");
  }

  isPublic(): Promise<boolean> {
    return this.isPresent("public-icon-container");
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

  getUncontrolledNeuronDetailsText(): Promise<string> {
    return this.getText("uncontrolled-neuron-detail");
  }

  getCheckboxPo(): CheckboxPo {
    return CheckboxPo.under({
      element: this.root,
    });
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }
}
