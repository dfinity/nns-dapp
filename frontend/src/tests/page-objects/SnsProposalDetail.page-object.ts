import { ProposalNavigationPo } from "$tests/page-objects/ProposalNavigation.page-object";
import { SkeletonDetailsPo } from "$tests/page-objects/SkeletonDetails.page-object";
import { SnsProposalSystemInfoSectionPo } from "$tests/page-objects/SnsProposalSystemInfoSection.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ProposalSummarySectionPo } from "./ProposalSummarySection.page-object";
import { SnsProposalPayloadSectionPo } from "./SnsProposalPayloadSection.page-object";
import { SnsProposalVotingSectionPo } from "./SnsProposalVotingSection.page-object";

export class SnsProposalDetailPo extends BasePageObject {
  private static readonly TID = "sns-proposal-details-grid";

  static under(element: PageObjectElement): SnsProposalDetailPo | null {
    return new SnsProposalDetailPo(element.byTestId(SnsProposalDetailPo.TID));
  }

  getSkeletonDetails(): SkeletonDetailsPo {
    return SkeletonDetailsPo.under(this.root);
  }

  getProposalNavigationPo(): ProposalNavigationPo {
    return ProposalNavigationPo.under(this.root);
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

  getPayloadSectionPo(): SnsProposalPayloadSectionPo {
    return SnsProposalPayloadSectionPo.under(this.root);
  }

  getPayloadText(): Promise<string> {
    return this.getPayloadSectionPo().getPayloadText();
  }

  getSummarySectionPo(): ProposalSummarySectionPo {
    return ProposalSummarySectionPo.under(this.root);
  }

  hasSummarySection(): Promise<boolean> {
    return this.getSummarySectionPo().isPresent();
  }

  getSnsProposalVotingSectionPo(): SnsProposalVotingSectionPo {
    return SnsProposalVotingSectionPo.under(this.root);
  }

  hasVotingToolbar(): Promise<boolean> {
    return this.getSnsProposalVotingSectionPo().hasVotingToolbar();
  }
}
