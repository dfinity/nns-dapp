import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { NnsStakeNeuronModalPo } from "$tests/page-objects/NnsStakeNeuronModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronsFooterPo extends BasePageObject {
  private static readonly TID = "nns-neurons-footer-component";

  static under(element: PageObjectElement): NnsNeuronsFooterPo {
    return new NnsNeuronsFooterPo(element.byTestId(NnsNeuronsFooterPo.TID));
  }

  getStakeNeuronsButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "stake-neuron-button",
    });
  }

  getNnsStakeNeuronModalPo(): NnsStakeNeuronModalPo {
    return NnsStakeNeuronModalPo.under(this.root);
  }

  clickStakeNeuronsButton(): Promise<void> {
    return this.getStakeNeuronsButtonPo().click();
  }

  async stakeNeuron({
    amount,
    dissolveDelayDays,
  }: {
    amount: number;
    dissolveDelayDays: "max" | 0;
  }): Promise<void> {
    await this.clickStakeNeuronsButton();
    const modal = this.getNnsStakeNeuronModalPo();
    await modal.stake({ amount, dissolveDelayDays });
    await modal.waitForAbsent();
  }
}
