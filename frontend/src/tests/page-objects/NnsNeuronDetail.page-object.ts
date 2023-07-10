import { NnsNeuronInfoStakePo } from "$tests/page-objects/NnsNeuronInfoStake.page-object";
import { NnsNeuronMaturityCardPo } from "$tests/page-objects/NnsNeuronMaturityCard.page-object";
import { NnsNeuronMetaInfoCardPageObjectPo } from "$tests/page-objects/NnsNeuronMetaInfoCard.page-object";
import { NnsNeuronModalsPo } from "$tests/page-objects/NnsNeuronModals.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronDetailPo extends BasePageObject {
  private static readonly TID = "nns-neuron-detail-component";

  static under(element: PageObjectElement): NnsNeuronDetailPo {
    return new NnsNeuronDetailPo(element.byTestId(NnsNeuronDetailPo.TID));
  }

  getSkeletonCardPos(): Promise<SkeletonCardPo[]> {
    return SkeletonCardPo.allUnder(this.root);
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

  async disburseNeuron(): Promise<void> {
    await this.getNnsNeuronInfoStakePo().clickDisburse();
    await this.getNnsNeuronModalsPo()
      .getDisburseNnsNeuronModalPo()
      .disburseNeuron();
  }
}
