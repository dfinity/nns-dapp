import { AddressInputPo } from "$tests/page-objects/AddressInput.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { NeuronSelectPercentagePo } from "$tests/page-objects/NeuronSelectPercentage.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class NeuronSelectMaturityDisbursementPo extends BasePageObject {
  private static TID = "neuron-select-disbursement-component";

  static under(element: PageObjectElement): NeuronSelectMaturityDisbursementPo {
    return new NeuronSelectMaturityDisbursementPo(
      element.byTestId(NeuronSelectMaturityDisbursementPo.TID)
    );
  }

  getNeuronSelectPercentagePo(): NeuronSelectPercentagePo {
    return NeuronSelectPercentagePo.under(this.root);
  }

  getAvailableMaturity(): Promise<string> {
    return this.getNeuronSelectPercentagePo().getAvailableMaturity();
  }

  getDestinationInput(): AddressInputPo {
    return AddressInputPo.under(this.root);
  }

  getInputRange(): PageObjectElement {
    return this.root.byTestId("input-range");
  }

  getNextButton(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "select-maturity-percentage-button",
    });
  }

  async getMaturityToDisburseText(): Promise<string> {
    return (await this.getText("maturity-to-disburse")).trim();
  }

  async getPercentageToDisburseText(): Promise<string> {
    return (await this.getText("percentage-to-disburse")).trim();
  }

  setPercentage(percentage: number): Promise<void> {
    return this.getInputRange().input(`${percentage}`);
  }

  setDestinationAddress(destination: string): Promise<void> {
    return this.getDestinationInput().enterAddress(destination);
  }

  clickNextButton(): Promise<void> {
    return this.getNextButton().click();
  }

  async isNextButtonDisabled(): Promise<boolean> {
    return this.getNextButton().isDisabled();
  }
}
