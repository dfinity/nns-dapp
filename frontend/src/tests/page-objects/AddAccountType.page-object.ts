import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddAccountTypePo extends BasePageObject {
  private static readonly TID = "add-account-type-component";

  static under(element: PageObjectElement): AddAccountTypePo {
    return new AddAccountTypePo(element.byTestId(AddAccountTypePo.TID));
  }

  chooseLinkedAccount(): Promise<void> {
    return this.root.byTestId("choose-linked-as-account-type").click();
  }
}
