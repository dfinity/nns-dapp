import { NeuronConfirmActionScreenPo } from "$tests/page-objects/NeuronConfirmActionScreen.page-object";
import { NeuronSelectMaturityDisbursementPo } from "$tests/page-objects/NeuronSelectMaturityDisbursement.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DisburseMaturityModalPo extends BasePageObject {
  private static readonly TID = "disburse-maturity-modal-component";

  static under(element: PageObjectElement): DisburseMaturityModalPo {
    return new DisburseMaturityModalPo(
      element.byTestId(DisburseMaturityModalPo.TID)
    );
  }

  getNeuronSelectMaturityDisbursementPo(): NeuronSelectMaturityDisbursementPo {
    return NeuronSelectMaturityDisbursementPo.under(this.root);
  }

  getNeuronConfirmActionScreenPo(): NeuronConfirmActionScreenPo {
    return NeuronConfirmActionScreenPo.under(this.root);
  }

  getTotalMaturity(): Promise<string> {
    return this.getText("total-maturity");
  }

  getConfirmPercentage(): Promise<string> {
    return this.getNeuronConfirmActionScreenPo().getText("confirm-percentage");
  }

  getConfirmAmount(): Promise<string> {
    return this.getNeuronConfirmActionScreenPo().getText("confirm-amount");
  }

  getConfirmDestination(): Promise<string> {
    return this.getNeuronConfirmActionScreenPo().getText("confirm-destination");
  }

  clickNextButton(): Promise<void> {
    return this.getNeuronSelectMaturityDisbursementPo().clickNextButton();
  }

  clickConfirmButton(): Promise<void> {
    return this.getNeuronConfirmActionScreenPo().clickConfirmButton();
  }

  async isNextButtonDisabled(): Promise<boolean> {
    return this.getNeuronSelectMaturityDisbursementPo().isNextButtonDisabled();
  }

  setPercentage(percentage: number): Promise<void> {
    return this.getNeuronSelectMaturityDisbursementPo().setPercentage(
      percentage
    );
  }

  setDestinationAddress(address: string): Promise<void> {
    return this.getNeuronSelectMaturityDisbursementPo().setDestinationAddress(
      address
    );
  }
}
