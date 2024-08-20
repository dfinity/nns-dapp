import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectStakeCellPo extends BasePageObject {
  private static readonly TID = "project-stake-cell-component";

  static under(element: PageObjectElement): ProjectStakeCellPo {
    return new ProjectStakeCellPo(element.byTestId(ProjectStakeCellPo.TID));
  }

  async getStake(): Promise<string> {
    return await this.getText();
  }
}
