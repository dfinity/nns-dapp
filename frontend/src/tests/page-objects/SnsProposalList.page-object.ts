import { PageBannerPo } from "$tests/page-objects/PageBanner.page-object";
import { ProposalCardPo } from "$tests/page-objects/ProposalCard.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { SnsProposalFiltersPo } from "$tests/page-objects/SnsProposalFilters.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalListPo extends BasePageObject {
  private static readonly TID = "sns-proposal-list-component";

  static under(element: PageObjectElement): SnsProposalListPo {
    return new SnsProposalListPo(element.byTestId(SnsProposalListPo.TID));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  getAllProposalList(): PageObjectElement {
    return this.root.byTestId("all-proposal-list");
  }

  getActionableProposalList(): PageObjectElement {
    return this.root.byTestId("actionable-proposal-list");
  }

  getSnsProposalFiltersPo(): SnsProposalFiltersPo {
    return SnsProposalFiltersPo.under(this.root);
  }

  getActionableSignInBanner(): PageBannerPo {
    return PageBannerPo.under({
      element: this.root,
      testId: "actionable-proposals-sign-in",
    });
  }

  getActionableNotSupportedBanner(): PageBannerPo {
    return PageBannerPo.under({
      element: this.root,
      testId: "actionable-proposals-not-supported",
    });
  }

  getActionableEmptyBanner(): PageBannerPo {
    return PageBannerPo.under({
      element: this.root,
      testId: "actionable-proposals-empty",
    });
  }

  getProposalCardPos(): Promise<ProposalCardPo[]> {
    return ProposalCardPo.allUnder(this.root);
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && !(await this.getSkeletonCardPo().isPresent())
    );
  }
}
