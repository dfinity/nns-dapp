import { AddSnsHotkeyModalPo } from "$tests/page-objects/AddSnsHotkeyModal.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { SnsIncreaseStakeNeuronModalPo } from "$tests/page-objects/SnsIncreaseStakeNeuronModal.page-object";
import { SnsNeuronFollowingCardPo } from "$tests/page-objects/SnsNeuronFollowingCard.page-object";
import { SnsNeuronHotkeysCardPo } from "$tests/page-objects/SnsNeuronHotkeysCard.page-object";
import { SnsNeuronInfoStakePo } from "$tests/page-objects/SnsNeuronInfoStake.page-object";
import { SnsNeuronMaturityCardPo } from "$tests/page-objects/SnsNeuronMaturityCard.page-object";
import { SnsNeuronMetaInfoCardPo } from "$tests/page-objects/SnsNeuronMetaInfoCard.page-object";
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

  getStake(): Promise<string> {
    return this.getStakeCardPo().getStakeAmount();
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

  getIncreaseStakeModalPo(): SnsIncreaseStakeNeuronModalPo {
    return SnsIncreaseStakeNeuronModalPo.under(this.root);
  }

  async increaseStake(amount: number): Promise<void> {
    await this.getStakeCardPo().getIncreaseStakeButtonPo().click();
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
}
