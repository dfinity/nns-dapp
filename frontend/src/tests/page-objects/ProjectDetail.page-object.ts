import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { ParticipateSwapModalPo } from "$tests/page-objects/ParticipateSwapModal.page-object";
import { ProjectInfoSectionPo } from "$tests/page-objects/ProjectInfoSection.page-object";
import { ProjectMetadataSectionPo } from "$tests/page-objects/ProjectMetadataSection.page-object";
import { ProjectStatusSectionPo } from "$tests/page-objects/ProjectStatusSection.page-object";
import { ProposalCardPo } from "$tests/page-objects/ProposalCard.page-object";
import { SaleInProgressModalPo } from "$tests/page-objects/SaleInProgressModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectDetailPo extends BasePageObject {
  private static readonly TID = "project-detail-component";

  static under(element: PageObjectElement): ProjectDetailPo {
    return new ProjectDetailPo(element.byTestId(ProjectDetailPo.TID));
  }

  getProjectMetadataSectionPo(): ProjectMetadataSectionPo {
    return ProjectMetadataSectionPo.under(this.root);
  }

  getProjectInfoSectionPo(): ProjectInfoSectionPo {
    return ProjectInfoSectionPo.under(this.root);
  }

  getProjectStatusSectionPo(): ProjectStatusSectionPo {
    return ProjectStatusSectionPo.under(this.root);
  }

  getParticipateButton(): ButtonPo {
    return this.getProjectStatusSectionPo()
      .getParticipateButtonPo()
      .getButton();
  }

  getParticipateSwapModalPo(): ParticipateSwapModalPo {
    return this.getProjectStatusSectionPo()
      .getParticipateButtonPo()
      .getParticipateSwapModalPo();
  }

  getProposalCardPo(): ProposalCardPo {
    return ProposalCardPo.under(this.root);
  }

  getSaleInProgressModalPo(): SaleInProgressModalPo {
    return SaleInProgressModalPo.under(this.root);
  }

  getProjectName(): Promise<string> {
    return this.getProjectMetadataSectionPo().getProjectName();
  }

  getTokenSymbol(): Promise<string> {
    return this.getProjectInfoSectionPo().getTokenSymbol();
  }

  getStatus(): Promise<string> {
    return this.getProjectStatusSectionPo().getStatus();
  }

  getCommitmentAmount(): Promise<string> {
    return this.getProjectStatusSectionPo().getCommitmentAmount();
  }

  hasCommitmentAmount(): Promise<boolean> {
    return this.getProjectStatusSectionPo().hasCommitmentAmount();
  }

  clickParticipate(): Promise<void> {
    return this.getProjectStatusSectionPo().clickParticipate();
  }

  participate(params: {
    amount: number;
    acceptConditions: boolean;
  }): Promise<void> {
    return this.getProjectStatusSectionPo().participate(params);
  }

  waitForContentLoaded(): Promise<void> {
    return this.getProjectMetadataSectionPo().waitForContentLoaded();
  }
}
