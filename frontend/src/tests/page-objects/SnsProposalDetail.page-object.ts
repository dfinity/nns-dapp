import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonDetailsPo } from "$tests/page-objects/SkeletonDetails.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalDetailPo extends BasePageObject {
  static readonly tid = "sns-proposal-details-grid";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsProposalDetailPo | null {
    return new SnsProposalDetailPo(
      element.querySelector(`[data-tid=${SnsProposalDetailPo.tid}]`)
    );
  }

  getSkeletonDetails(): SkeletonDetailsPo {
    return SkeletonDetailsPo.under(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && !(await this.getSkeletonDetails().isPresent())
    );
  }
}
