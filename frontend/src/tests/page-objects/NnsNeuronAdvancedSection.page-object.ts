import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { NnsNeuronAgePo } from "./NnsNeuronAge.page-object";

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

  getNnsNeuronAgePo(): NnsNeuronAgePo {
    return NnsNeuronAgePo.under(this.root);
  }

  neuronAge(): Promise<string> {
    return this.getNnsNeuronAgePo().neuronAge();
  }

  neuronAccount(): Promise<string> {
    return this.getText("neuron-account");
  }

  lastRewardsDistribution(): Promise<string> {
    return this.getText("last-rewards-distribution");
  }

  hasStakeMaturityCheckbox(): Promise<boolean> {
    return this.root
      .byTestId("auto-stake-maturity-checkbox-component")
      .isPresent();
  }

  hasJoinNeuronsFundCheckbox(): Promise<boolean> {
    return this.root.querySelector("#join-community-fund-checkbox").isPresent();
  }

  hasSplitNeuronButton(): Promise<boolean> {
    return this.getButton("split-nns-neuron-button-component").isPresent();
  }
}
