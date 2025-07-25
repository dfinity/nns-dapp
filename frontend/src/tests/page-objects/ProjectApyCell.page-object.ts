import { ApyDisplayPo } from "$tests/page-objects/ApyDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectApyCellPo extends BasePageObject {
  private static readonly TID = "project-apy-cell-component";

  static under(element: PageObjectElement): ProjectApyCellPo {
    return new ProjectApyCellPo(element.byTestId(ProjectApyCellPo.TID));
  }

  getApyDisplayPo(): ApyDisplayPo {
    return ApyDisplayPo.under(this.root);
  }
}
