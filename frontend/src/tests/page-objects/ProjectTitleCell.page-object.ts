import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectTitleCellPo extends BasePageObject {
  private static readonly TID = "project-title-cell-component";

  static under(element: PageObjectElement): ProjectTitleCellPo {
    return new ProjectTitleCellPo(element.byTestId(ProjectTitleCellPo.TID));
  }

  getProjectTitle(): Promise<string> {
    return this.getText("project-title");
  }
}
