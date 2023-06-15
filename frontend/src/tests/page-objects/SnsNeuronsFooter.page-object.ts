import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { SnsStakeNeuronModalPo } from "$tests/page-objects/SnsStakeNeuronModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronsFooterPo extends BasePageObject {
  private static readonly TID = "sns-neurons-footer-component";

  static under(element: PageObjectElement): SnsNeuronsFooterPo {
    return new SnsNeuronsFooterPo(element.byTestId(SnsNeuronsFooterPo.TID));
  }

  getStakeNeuronsButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "stake-sns-neuron-button",
    });
  }

  getSnsStakeNeuronModalPo(): SnsStakeNeuronModalPo {
    return SnsStakeNeuronModalPo.under(this.root);
  }

  clickStakeNeuronsButton(): Promise<void> {
    return this.getStakeNeuronsButtonPo().click();
  }

  async stakeNeuron(amount: number): Promise<void> {
    await this.clickStakeNeuronsButton();
    const modal = this.getSnsStakeNeuronModalPo();
    await modal.stake(amount);
    await modal.waitForAbsent();
  }
}
