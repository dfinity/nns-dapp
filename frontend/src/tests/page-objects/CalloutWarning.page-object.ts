import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CalloutWarningPo extends BasePageObject {
  private static readonly TID = "callout-warning-component";

  static under(element: PageObjectElement): CalloutWarningPo {
    return new CalloutWarningPo(element.byTestId(CalloutWarningPo.TID));
  }

  getDescription(): Promise<string> {
    return this.getText("text");
  }
}
