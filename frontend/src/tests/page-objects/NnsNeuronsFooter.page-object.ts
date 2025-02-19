import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { MergeNeuronsModalPo } from "$tests/page-objects/MergeNeuronsModal.page-object";
import { NnsStakeNeuronModalPo } from "$tests/page-objects/NnsStakeNeuronModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronsFooterPo extends BasePageObject {
  private static readonly TID = "nns-neurons-footer-component";

  static under(element: PageObjectElement): NnsNeuronsFooterPo {
    return new NnsNeuronsFooterPo(element.byTestId(NnsNeuronsFooterPo.TID));
  }

  getStakeNeuronsButtonPo(): ButtonPo {
    return this.getButton("stake-neuron-button");
  }

  getNnsStakeNeuronModalPo(): NnsStakeNeuronModalPo {
    return NnsStakeNeuronModalPo.under(this.root);
  }

  getMergeNeuronsModalPo(): MergeNeuronsModalPo {
    return MergeNeuronsModalPo.under(this.root);
  }

  clickStakeNeuronsButton(): Promise<void> {
    return this.getStakeNeuronsButtonPo().click();
  }

  clickMergeNeuronsButton(): Promise<void> {
    return this.click("merge-neurons-button");
  }

  async stakeNeuron({
    amount,
    dissolveDelayDays,
  }: {
    amount: number;
    dissolveDelayDays: "max" | number;
  }): Promise<void> {
    await this.clickStakeNeuronsButton();
    const modal = this.getNnsStakeNeuronModalPo();
    await modal.stake({ amount, dissolveDelayDays });
    await modal.waitForAbsent();
  }

  async mergeNeurons({
    sourceNeurondId,
    targetNeuronId,
  }: {
    sourceNeurondId: string;
    targetNeuronId: string;
  }): Promise<void> {
    await this.clickMergeNeuronsButton();
    const modal = this.getMergeNeuronsModalPo();
    await modal.mergeNeurons({ sourceNeurondId, targetNeuronId });
    await modal.waitForClosed();
  }
}
