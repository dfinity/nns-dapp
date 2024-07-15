import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectNeuronsCellPo extends BasePageObject {
  private static readonly TID = "project-neurons-cell-component";

  static under(element: PageObjectElement): ProjectNeuronsCellPo {
    return new ProjectNeuronsCellPo(element.byTestId(ProjectNeuronsCellPo.TID));
  }

  async getNeuronCount(): Promise<string> {
    return await this.getText();
  }
}
