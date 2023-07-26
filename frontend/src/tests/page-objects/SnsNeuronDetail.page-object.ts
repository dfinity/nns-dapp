import { AddSnsHotkeyModalPo } from "$tests/page-objects/AddSnsHotkeyModal.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { SnsIncreaseStakeNeuronModalPo } from "$tests/page-objects/SnsIncreaseStakeNeuronModal.page-object";
import { SnsNeuronAdvancedSectionPo } from "$tests/page-objects/SnsNeuronAdvancedSection.page-object";
import { SnsNeuronFollowingCardPo } from "$tests/page-objects/SnsNeuronFollowingCard.page-object";
import { SnsNeuronHotkeysCardPo } from "$tests/page-objects/SnsNeuronHotkeysCard.page-object";
import { SnsNeuronInfoStakePo } from "$tests/page-objects/SnsNeuronInfoStake.page-object";
import { SnsNeuronMaturityCardPo } from "$tests/page-objects/SnsNeuronMaturityCard.page-object";
import { SnsNeuronMaturitySectionPo } from "$tests/page-objects/SnsNeuronMaturitySection.page-object";
import { SnsNeuronMetaInfoCardPo } from "$tests/page-objects/SnsNeuronMetaInfoCard.page-object";
import { SnsNeuronPageHeaderPo } from "$tests/page-objects/SnsNeuronPageHeader.page-object";
import { SnsNeuronVotingPowerSectionPo } from "$tests/page-objects/SnsNeuronVotingPowerSection.page-object";
import { SummaryPo } from "$tests/page-objects/Summary.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronDetailPo extends BasePageObject {
  private static readonly TID = "sns-neuron-detail-component";

  static under(element: PageObjectElement): SnsNeuronDetailPo {
    return new SnsNeuronDetailPo(element.byTestId(SnsNeuronDetailPo.TID));
  }

  getSkeletonCardPos(): Promise<SkeletonCardPo[]> {
    return SkeletonCardPo.allUnder(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && (await this.getSkeletonCardPos()).length === 0
    );
  }

  getMetaInfoCardPo(): SnsNeuronMetaInfoCardPo {
    return SnsNeuronMetaInfoCardPo.under(this.root);
  }

  getHotkeysCardPo(): SnsNeuronHotkeysCardPo {
    return SnsNeuronHotkeysCardPo.under(this.root);
  }

  getMaturityCardPo(): SnsNeuronMaturityCardPo {
    return SnsNeuronMaturityCardPo.under(this.root);
  }

  getStakeCardPo(): SnsNeuronInfoStakePo {
    return SnsNeuronInfoStakePo.under(this.root);
  }

  // TODO: Remove GIX-1688
  getStake(): Promise<string> {
    return this.getStakeCardPo().getStakeAmount();
  }

  // TODO: Rename GIX-1688
  getStakeNewUI(): Promise<string> {
    return this.getVotingPowerSectionPo().getStakeAmount();
  }

  getFollowingCardPo(): SnsNeuronFollowingCardPo {
    return SnsNeuronFollowingCardPo.under(this.root);
  }

  getSummaryPo(): SummaryPo {
    return SummaryPo.under(this.root);
  }

  async getTitle(): Promise<string> {
    return (await this.getSummaryPo().getTitle()).trim();
  }

  getPageHeader(): SnsNeuronPageHeaderPo {
    return SnsNeuronPageHeaderPo.under(this.root);
  }

  getUniverse(): Promise<string> {
    return this.getPageHeader().getUniverse();
  }

  getIncreaseStakeModalPo(): SnsIncreaseStakeNeuronModalPo {
    return SnsIncreaseStakeNeuronModalPo.under(this.root);
  }

  // TODO: Remove GIX-1688
  async increaseStake(amount: number): Promise<void> {
    await this.getStakeCardPo().getIncreaseStakeButtonPo().click();
    await this.getIncreaseStakeModalPo().increase(amount);
  }

  // TODO: Rename GIX-1688
  async increaseStakeNewUI(amount: number): Promise<void> {
    await this.getVotingPowerSectionPo().clickIncrease();
    await this.getIncreaseStakeModalPo().increase(amount);
  }

  getAddSnsHotkeyModalPo(): AddSnsHotkeyModalPo {
    return AddSnsHotkeyModalPo.under(this.root);
  }

  async addHotkey(principal: string): Promise<void> {
    await this.getHotkeysCardPo().clickAddHotkey();
    const modal = this.getAddSnsHotkeyModalPo();
    await modal.waitFor();
    await modal.addHotkey(principal);
    await modal.waitForAbsent();
  }

  removeHotkey(principal: string): Promise<void> {
    return this.getHotkeysCardPo().removeHotkey(principal);
  }

  getHotkeyPrincipals(): Promise<string[]> {
    return this.getHotkeysCardPo().getHotkeyPrincipals();
  }

  getVotingPowerSectionPo(): SnsNeuronVotingPowerSectionPo {
    return SnsNeuronVotingPowerSectionPo.under(this.root);
  }

  getMaturitySectionPo(): SnsNeuronMaturitySectionPo {
    return SnsNeuronMaturitySectionPo.under(this.root);
  }

  getAdvancedSectionPo(): SnsNeuronAdvancedSectionPo {
    return SnsNeuronAdvancedSectionPo.under(this.root);
  }
}
