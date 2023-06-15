import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AdditionalInfoFormPo extends BasePageObject {
  private static readonly TID = "additional-info-form-component";

  static under(element: PageObjectElement): AdditionalInfoFormPo {
    return new AdditionalInfoFormPo(element.byTestId(AdditionalInfoFormPo.TID));
  }

  hasConditions(): Promise<boolean> {
    return this.root.byTestId("conditions").isPresent();
  }

  getConditions(): Promise<string> {
    return this.getText("conditions");
  }

  toggleConditionsAccepted(): Promise<void> {
    return this.click("checkbox");
  }
}
