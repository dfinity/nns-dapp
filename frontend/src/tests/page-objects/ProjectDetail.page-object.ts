import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ProjectInfoSectionPo } from "$tests/page-objects/ProjectInfoSection.page-object";
import { ProjectMetadataSectionPo } from "$tests/page-objects/ProjectMetadataSection.page-object";
import { ProjectStatusSectionPo } from "$tests/page-objects/ProjectStatusSection.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";

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
