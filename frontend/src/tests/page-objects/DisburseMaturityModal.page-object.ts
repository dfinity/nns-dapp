import { NeuronConfirmActionScreenPo } from "$tests/page-objects/NeuronConfirmActionScreen.page-object";
import { NeuronSelectPercentagePo } from "$tests/page-objects/NeuronSelectPercentage.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TooltipPo } from "./Tooltip.page-object";

export class DisburseMaturityModalPo extends BasePageObject {
  private static readonly TID = "disburse-maturity-modal-component";

  static under(element: PageObjectElement): DisburseMaturityModalPo {
    return new DisburseMaturityModalPo(
      element.byTestId(DisburseMaturityModalPo.TID)
    );
  }

  getNeuronSelectPercentagePo(): NeuronSelectPercentagePo {
    return NeuronSelectPercentagePo.under(this.root);
  }

  getNeuronConfirmActionScreenPo(): NeuronConfirmActionScreenPo {
    return NeuronConfirmActionScreenPo.under(this.root);
  }

  clickNextButton(): Promise<void> {
    return this.getNeuronSelectPercentagePo().clickNextButton();
  }

  clickConfirmButton(): Promise<void> {
    return this.getNeuronConfirmActionScreenPo().clickConfirmButton();
  }

  isNextButtonDisabled(): Promise<boolean> {
    return this.getNeuronSelectPercentagePo().isNextButtonDisabled();
  }

  setPercentage(percentage: number): Promise<void> {
    return this.getNeuronSelectPercentagePo().setPercentage(percentage);
  }

  getAmountMaturityToDisburse(): Promise<string> {
    return this.getNeuronSelectPercentagePo().getAmountMaturity();
  }

  getTotalMaturity(): Promise<string> {
    return this.getNeuronSelectPercentagePo().getAvailableMaturity();
  }

  async getConfirmTokens(): Promise<string> {
    return (
      await this.getNeuronConfirmActionScreenPo().getText("confirm-tokens")
    ).trim();
  }

  async getConfirmPercentage(): Promise<string> {
    return (
      await this.getNeuronConfirmActionScreenPo().getText("confirm-percentage")
    ).trim();
  }

  getConfirmDestination(): Promise<string> {
    return this.getNeuronConfirmActionScreenPo().getText("confirm-destination");
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getConfirmTokensDetailed(): Promise<string> {
    return this.getTooltipPo().getText();
  }
}
