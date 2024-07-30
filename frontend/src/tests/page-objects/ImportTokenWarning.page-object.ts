import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenWarningPo extends BasePageObject {
  private static readonly TID = "import-token-warning-component";

  static under(element: PageObjectElement): ImportTokenWarningPo {
    return new ImportTokenWarningPo(element.byTestId(ImportTokenWarningPo.TID));
  }

  getDescription(): Promise<string> {
    return this.getText("text");
  }
}
