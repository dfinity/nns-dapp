import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonDetailsPo } from "$tests/page-objects/SkeletonDetails.page-object";
import { SnsProposalSystemInfoSectionPo } from "$tests/page-objects/SnsProposalSystemInfoSection.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalDetailPo extends BasePageObject {
  private static readonly TID = "sns-proposal-details-grid";

  static under(element: PageObjectElement): SnsProposalDetailPo | null {
    return new SnsProposalDetailPo(element.byTestId(SnsProposalDetailPo.TID));
  }

  getSkeletonDetails(): SkeletonDetailsPo {
    return SkeletonDetailsPo.under(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && !(await this.getSkeletonDetails().isPresent())
    );
  }

  getSystemInfoSectionPo(): SnsProposalSystemInfoSectionPo {
    return SnsProposalSystemInfoSectionPo.under(this.root);
  }

  hasSystemInfoSection(): Promise<boolean> {
    return this.getSystemInfoSectionPo().isPresent();
  }

  getSystemInfoSectionTitle(): Promise<string> {
    return this.getSystemInfoSectionPo().getTitleText();
  }
}
