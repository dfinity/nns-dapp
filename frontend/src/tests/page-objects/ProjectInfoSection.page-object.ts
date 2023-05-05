import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectInfoSectionPo extends BasePageObject {
  private static readonly TID = "sns-project-detail-info";

  static under(element: PageObjectElement): ProjectInfoSectionPo {
    return new ProjectInfoSectionPo(element.byTestId(ProjectInfoSectionPo.TID));
  }

  getTokenSymbol(): Promise<string> {
    return this.getText("sns-project-detail-info-token-symbol");
  }
}
