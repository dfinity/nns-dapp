import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ProjectStatusPo } from "$tests/page-objects/ProjectStatus.page-object";
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

  getStatus(): Promise<string> {
    return this.getProjectStatusPo().getStatus();
  }
}
