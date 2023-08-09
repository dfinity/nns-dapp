import { SnsNeuronVestingPeriodRemainingPo } from "$tests/page-objects/SnsNeuronVestingPeriodRemaining.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SnsNeuronAgePo } from "./SnsNeuronAge.page-object";

export class SnsNeuronAdvancedSectionPo extends BasePageObject {
  private static readonly TID = "sns-neuron-advanced-section-component";

  static under(element: PageObjectElement): SnsNeuronAdvancedSectionPo {
    return new SnsNeuronAdvancedSectionPo(
      element.byTestId(SnsNeuronAdvancedSectionPo.TID)
    );
  }

  neuronId(): Promise<string> {
    return this.getText("neuron-id");
  }

  neuronCreated(): Promise<string> {
    return this.getText("neuron-created");
  }

  dissolveDate(): Promise<string> {
    return this.getText("neuron-dissolve-date");
  }

  getNnsNeuronAgePo(): SnsNeuronAgePo {
    return SnsNeuronAgePo.under(this.root);
  }

  neuronAge(): Promise<string> {
    return this.getNnsNeuronAgePo().getNeuronAge();
  }

  neuronAccount(): Promise<string> {
    return this.getText("neuron-account");
  }

  getVestingPeriodPo(): SnsNeuronVestingPeriodRemainingPo {
    return SnsNeuronVestingPeriodRemainingPo.under(this.root);
  }

  vestingPeriodIsPresent(): Promise<boolean> {
    return this.getVestingPeriodPo().vestingPeriodIsPresent();
  }

  hasStakeMaturityCheckbox(): Promise<boolean> {
    return this.root
      .byTestId("auto-stake-maturity-checkbox-component")
      .isPresent();
  }

  hasSplitNeuronButton(): Promise<boolean> {
    return this.getButton("split-neuron-button").isPresent();
  }
}
