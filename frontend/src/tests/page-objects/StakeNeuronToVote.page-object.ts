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

  getTitle(): PageObjectElement {
    return this.root.byTestId("stake-neuron-title");
  }

  getTitleText(): Promise<string> {
    return this.getTitle().getText();
  }

  getDescription(): PageObjectElement {
    return this.root.byTestId("stake-neuron-description");
  }

  getDescriptionText(): Promise<string> {
    return this.getDescription().getText();
  }

  getGotoNeuronsLink(): PageObjectElement {
    return this.getElement("stake-neuron-button");
  }

  getGotoNeuronsLinkText(): Promise<string> {
    return this.getGotoNeuronsLink().getText();
  }

  getGotoNeuronsLinkHref(): Promise<string> {
    return this.getGotoNeuronsLink().getAttribute("href");
  }
}
