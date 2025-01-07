import { NnsNeuronAdvancedSectionPo } from "$tests/page-objects/NnsNeuronAdvancedSection.page-object";
import { NnsNeuronHotkeysCardPo } from "$tests/page-objects/NnsNeuronHotkeysCard.page-object";
import { NnsNeuronMaturitySectionPo } from "$tests/page-objects/NnsNeuronMaturitySection.page-object";
import { NnsNeuronModalsPo } from "$tests/page-objects/NnsNeuronModals.page-object";
import { NnsNeuronTestnetFunctionsCardPo } from "$tests/page-objects/NnsNeuronTestnetFunctionsCard.page-object";
import { NnsNeuronVotingPowerSectionPo } from "$tests/page-objects/NnsNeuronVotingPowerSection.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ConfirmFollowingBannerPo } from "./ConfirmFollowingBanner.page-object";
import { NnsNeuronPageHeaderPo } from "./NnsNeuronPageHeader.page-object";
import { NnsNeuronRewardStatusActionPo } from "./NnsNeuronRewardStatusAction.page-object";

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

  async unlockNeuron(): Promise<void> {
    await this.click("unlock-neuron-button");
    await this.root
      .byTestId("unlock-neuron-button")
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

  getConfirmFollowingBannerPo(): ConfirmFollowingBannerPo {
    return ConfirmFollowingBannerPo.under(this.root);
  }

  getNnsNeuronRewardStatusActionPo(): NnsNeuronRewardStatusActionPo {
    return NnsNeuronRewardStatusActionPo.under(this.root);
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

  getNnsNeuronHotkeysCardPo(): NnsNeuronHotkeysCardPo {
    return NnsNeuronHotkeysCardPo.under(this.root);
  }

  getNnsNeuronTestnetFunctionsCardPo(): NnsNeuronTestnetFunctionsCardPo {
    return NnsNeuronTestnetFunctionsCardPo.under(this.root);
  }

  async increaseStake({ amount }: { amount: number }): Promise<void> {
    await this.getVotingPowerSectionPo().getStakeItemActionPo().clickIncrease();
    const modal = this.getNnsNeuronModalsPo().getIncreaseNeuronStakeModalPo();
    await modal.increaseStake({ amount });
    await modal.waitForAbsent();
  }

  async startDissolving(): Promise<void> {
    await this.getVotingPowerSectionPo()
      .getNeuronStateItemActionPo()
      .getDissolveButtonPo()
      .click();
    const modal = this.getNnsNeuronModalsPo().getDissolveActionButtonModalPo();
    await modal.confirmYes();
  }

  async addHotkey(principal: string): Promise<void> {
    await this.getNnsNeuronHotkeysCardPo().clickAddHotkey();
    await this.getNnsNeuronModalsPo()
      .getAddHotkeyModalPo()
      .addHotkey(principal);
  }

  async joinCommunityFund(): Promise<void> {
    await this.getAdvancedSectionPo().clickJoinCommunityFundCheckbox();
    const modal =
      await this.getNnsNeuronModalsPo().getJoinCommunityFundModalPo();
    await modal.confirmYes();
  }

  async addMaturity(amount: number): Promise<void> {
    await this.getNnsNeuronTestnetFunctionsCardPo().clickAddMaturity();
    await this.getNnsNeuronModalsPo()
      .getNnsAddMaturityModalPo()
      .addMaturity(amount);
  }

  async spawnNeuron({ percentage }: { percentage: number }): Promise<void> {
    await this.getMaturitySectionPo()
      .getAvailableMaturityItemActionPo()
      .getSpawnButton()
      .click();
    await this.getNnsNeuronModalsPo()
      .getSpawnNeuronModalPo()
      .spawnNeuron({ percentage });
  }
}
