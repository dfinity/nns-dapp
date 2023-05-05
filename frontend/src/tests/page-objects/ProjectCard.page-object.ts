import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectCardPo extends BasePageObject {
  private static readonly TID = "project-card-component";

  static async allUnder(element: PageObjectElement): Promise<ProjectCardPo[]> {
    return Array.from(await element.allByTestId(ProjectCardPo.TID)).map(
      (el) => new ProjectCardPo(el)
    );
  }

  getProjectName(): Promise<string> {
    return this.getText("project-name");
  }
}
