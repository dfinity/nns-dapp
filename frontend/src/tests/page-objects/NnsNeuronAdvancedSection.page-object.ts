import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import { NnsNeuronAgePo } from "$tests/page-objects/NnsNeuronAge.page-object";
import { NnsNeuronPublicVisibilityActionPo } from "$tests/page-objects/NnsNeuronPublicVisibilityAction.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronAdvancedSectionPo extends BasePageObject {
  private static readonly TID = "nns-neuron-advanced-section-component";

  static under(element: PageObjectElement): NnsNeuronAdvancedSectionPo {
    return new NnsNeuronAdvancedSectionPo(
      element.byTestId(NnsNeuronAdvancedSectionPo.TID)
    );
  }

  neuronId(): Promise<string> {
    return this.getText("neuron-id");
  }

  neuronCreated(): Promise<string> {
    return this.getText("neuron-created");
  }

  dissolveDate(): Promise<string | null> {
    return this.getText("neuron-dissolve-date");
  }

  getNnsNeuronAgePo(): NnsNeuronAgePo {
    return NnsNeuronAgePo.under(this.root);
  }

  neuronAge(): Promise<string> {
    return this.getNnsNeuronAgePo().neuronAge();
  }

  neuronAccount(): Promise<string> {
    return HashPo.under(this.root.byTestId("neuron-account-row")).getFullText();
  }

  lastRewardsDistribution(): Promise<string> {
    return this.getText("last-rewards-distribution");
  }

  hasStakeMaturityCheckbox(): Promise<boolean> {
    return this.root
      .byTestId("auto-stake-maturity-checkbox-component")
      .isPresent();
  }

  getJoinNeuronsFundCheckbox(): PageObjectElement {
    return this.root.querySelector("#join-community-fund-checkbox");
  }

  hasJoinNeuronsFundCheckbox(): Promise<boolean> {
    return this.getJoinNeuronsFundCheckbox().isPresent();
  }

  hasSplitNeuronButton(): Promise<boolean> {
    return this.getButton("split-nns-neuron-button-component").isPresent();
  }

  async clickJoinCommunityFundCheckbox(): Promise<void> {
    return CheckboxPo.under({
      element: this.root,
      testId: "join-community-fund-checkbox-component",
    }).toggle();
  }

  getNnsNeuronPublicVisibilityActionPo(): NnsNeuronPublicVisibilityActionPo {
    return NnsNeuronPublicVisibilityActionPo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getText("neuron-id");
  }
}
