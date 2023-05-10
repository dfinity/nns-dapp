import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { ProjectStatusPo } from "$tests/page-objects/ProjectStatus.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectStatusSectionPo extends BasePageObject {
  private static readonly TID = "sns-project-detail-status";

  static under(element: PageObjectElement): ProjectStatusSectionPo {
    return new ProjectStatusSectionPo(
      element.byTestId(ProjectStatusSectionPo.TID)
    );
  }

  getProjectStatusPo(): ProjectStatusPo {
    return ProjectStatusPo.under(this.root);
  }

  getCommitmentAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root.byTestId("sns-user-commitment"));
  }

  getStatus(): Promise<string> {
    return this.getProjectStatusPo().getStatus();
  }

  getCommitmentAmount(): Promise<string> {
    return this.getCommitmentAmountDisplayPo().getAmount();
  }

  hasCommitmentAmount(): Promise<boolean> {
    return this.getCommitmentAmountDisplayPo().isPresent();
  }
}
