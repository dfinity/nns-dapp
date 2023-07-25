import { NnsNeuronAdvancedSectionPo } from "$tests/page-objects/NnsNeuronAdvancedSection.page-object";
import { NnsNeuronInfoStakePo } from "$tests/page-objects/NnsNeuronInfoStake.page-object";
import { NnsNeuronMaturityCardPo } from "$tests/page-objects/NnsNeuronMaturityCard.page-object";
import { NnsNeuronMaturitySectionPo } from "$tests/page-objects/NnsNeuronMaturitySection.page-object";
import { NnsNeuronMetaInfoCardPageObjectPo } from "$tests/page-objects/NnsNeuronMetaInfoCard.page-object";
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

  getNnsNeuronMetaInfoCardPageObjectPo(): NnsNeuronMetaInfoCardPageObjectPo {
    return NnsNeuronMetaInfoCardPageObjectPo.under(this.root);
  }

  async createDummyProposals(): Promise<void> {
    await this.click("make-dummy-proposals-button");
    await this.root
      .byTestId("make-dummy-proposals-button")
      .byTestId("spinner")
      .waitForAbsent();
  }

  getNnsNeuronInfoStakePo(): NnsNeuronInfoStakePo {
    return NnsNeuronInfoStakePo.under(this.root);
  }

  getNnsNeuronModalsPo(): NnsNeuronModalsPo {
    return NnsNeuronModalsPo.under(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && (await this.getSkeletonCardPos()).length === 0
    );
  }

  getMaturityCardPo(): NnsNeuronMaturityCardPo {
    return NnsNeuronMaturityCardPo.under(this.root);
  }

  // TODO: To be removed https://dfinity.atlassian.net/browse/GIX-1688
  hasJoinFundCard(): Promise<boolean> {
    return this.root.byTestId("neuron-join-fund-card-component").isPresent();
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

  // TODO: Remove when ENABLE_NEURON_SETTINGS is cleaned up.
  //       See https://dfinity.atlassian.net/browse/GIX-1688
  getNeuronIdOldUi(): Promise<string | null> {
    return this.getNnsNeuronMetaInfoCardPageObjectPo().getNeuronId();
  }

  getNeuronIdNewUi(): Promise<string | null> {
    return this.getPageHeaderPo().getNeuronId();
  }

  // TODO: Remove when ENABLE_NEURON_SETTINGS is cleaned up.
  //       See https://dfinity.atlassian.net/browse/GIX-1688
  async isNewUi(): Promise<boolean> {
    await Promise.race([
      this.getNnsNeuronMetaInfoCardPageObjectPo().waitFor(),
      this.getPageHeaderPo().waitFor(),
    ]);

    return this.getPageHeaderPo().isPresent();
  }

  async getNeuronId(): Promise<string> {
    if (await this.isNewUi()) {
      return this.getNeuronIdNewUi();
    }
    return this.getNeuronIdOldUi();
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
}
