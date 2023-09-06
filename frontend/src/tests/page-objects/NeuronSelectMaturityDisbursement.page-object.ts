import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class NeuronSelectMaturityDisbursementPo extends BasePageObject {
  private static TID = "neuron-select-disbursement-component";

  static under(element: PageObjectElement): NeuronSelectMaturityDisbursementPo {
    return new NeuronSelectMaturityDisbursementPo(
      element.byTestId(NeuronSelectMaturityDisbursementPo.TID)
    );
  }

  async getTotalMaturity(): Promise<string> {
    return (await this.getText("total-maturity")).trim();
  }

  getDestinationInput(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "destination-address",
    });
  }

  getInputRange(): PageObjectElement {
    return this.root.byTestId("input-range");
  }

  getNextButton(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "next-button",
    });
  }

  async getMaturityToDisburse(): Promise<string> {
    return (await this.getText("maturity-to-disburse")).trim();
  }

  async getPercentageToDisburse(): Promise<string> {
    return (await this.getText("percentage-to-disburse")).trim();
  }

  setPercentage(percentage: number): Promise<void> {
    return this.getInputRange().input(`${percentage}`);
  }

  setDestinationAddress(destination: string): Promise<void> {
    return this.getDestinationInput().typeText(destination);
  }

  clickNextButton(): Promise<void> {
    return this.getNextButton().click();
  }

  async isNextButtonDisabled(): Promise<boolean> {
    return this.getNextButton().isDisabled();
  }
}
