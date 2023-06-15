import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectCardPo extends CardPo {
  private static readonly TID = "project-card-component";

  static async allUnder(element: PageObjectElement): Promise<ProjectCardPo[]> {
    return Array.from(await element.allByTestId(ProjectCardPo.TID)).map(
      (el) => new ProjectCardPo(el)
    );
  }

  static under(element: PageObjectElement): ProjectCardPo {
    return new ProjectCardPo(element.byTestId(ProjectCardPo.TID));
  }

  getProjectName(): Promise<string> {
    return this.getText("project-name");
  }
}
