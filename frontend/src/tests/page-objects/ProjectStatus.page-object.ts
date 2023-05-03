import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectStatusPo extends BasePageObject {
  private static readonly TID = "project-status-component";

  static under(element: PageObjectElement): ProjectStatusPo {
    return new ProjectStatusPo(element.byTestId(ProjectStatusPo.TID));
  }

  getStatus(): Promise<string> {
    return this.getText("tag");
  }
}
