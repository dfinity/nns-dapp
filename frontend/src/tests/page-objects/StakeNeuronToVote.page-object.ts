import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class StakeNeuronToVotePo extends BasePageObject {
  private static readonly TID = "stake-neuron-to-vote-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): StakeNeuronToVotePo {
    return new StakeNeuronToVotePo(element.byTestId(StakeNeuronToVotePo.TID));
  }

  getExpandButton(): ButtonPo {
    return this.getButton("expand-icon");
  }

  clickExpand(): Promise<void> {
    return this.getExpandButton().click();
  }

  getDescription(): PageObjectElement {
    return this.root.byTestId("stake-neuron-description");
  }

  getDescriptionText(): Promise<string> {
    return this.getDescription().getText();
  }

  getGotoNeuronsButton(): ButtonPo {
    return this.getButton("stake-neuron-button");
  }

  getGotoNeuronsButtonText(): Promise<string> {
    return this.getGotoNeuronsButton().getText();
  }

  clickGotoNeurons(): Promise<void> {
    return this.getGotoNeuronsButton().click();
  }
}
