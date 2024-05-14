import { NnsNeuronAdvancedSectionPo } from "$tests/page-objects/NnsNeuronAdvancedSection.page-object";
import { NnsNeuronMaturitySectionPo } from "$tests/page-objects/NnsNeuronMaturitySection.page-object";
import { NnsNeuronModalsPo } from "$tests/page-objects/NnsNeuronModals.page-object";
import { NnsNeuronVotingPowerSectionPo } from "$tests/page-objects/NnsNeuronVotingPowerSection.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { NnsNeuronPageHeaderPo } from "./NnsNeuronPageHeader.page-object";

export class NnsNeuronDetailPo extends BasePageObject {
  private static readonly TID = "nns-neuron-detail-component";

  static under(element: PageObjectElement): NnsNeuronDetailPo {
    return new NnsNeuronDetailPo(element.byTestId(NnsNeuronDetailPo.TID));
  }

  getSkeletonCardPos(): Promise<SkeletonCardPo[]> {
    return SkeletonCardPo.allUnder(this.root);
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  async createDummyProposals(): Promise<void> {
    await this.click("make-dummy-proposals-button");
    await this.root
      .byTestId("make-dummy-proposals-button")
      .byTestId("spinner")
      .waitForAbsent();
  }

  getNnsNeuronModalsPo(): NnsNeuronModalsPo {
    return NnsNeuronModalsPo.under(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && (await this.getSkeletonCardPos()).length === 0
    );
  }

  async disburseNeuron(): Promise<void> {
    await this.getVotingPowerSectionPo().clickDisburse();
    await this.getNnsNeuronModalsPo()
      .getDisburseNnsNeuronModalPo()
      .disburseNeuron();
  }

  getPageHeaderPo(): NnsNeuronPageHeaderPo {
    return NnsNeuronPageHeaderPo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getPageHeaderPo().getNeuronId();
  }

  getUniverse(): Promise<string> {
    return this.getPageHeaderPo().getUniverse();
  }

  getVotingPowerSectionPo(): NnsNeuronVotingPowerSectionPo {
    return NnsNeuronVotingPowerSectionPo.under(this.root);
  }

  getMaturitySectionPo(): NnsNeuronMaturitySectionPo {
    return NnsNeuronMaturitySectionPo.under(this.root);
  }

  getAdvancedSectionPo(): NnsNeuronAdvancedSectionPo {
    return NnsNeuronAdvancedSectionPo.under(this.root);
  }

  async increaseStake({ amount }: { amount: number }): Promise<void> {
    await this.getVotingPowerSectionPo().getStakeItemActionPo().clickIncrease();
    const modal = this.getNnsNeuronModalsPo().getIncreaseNeuronStakeModalPo();
    await modal.increaseStake({ amount });
    await modal.waitForAbsent();
  }
}
