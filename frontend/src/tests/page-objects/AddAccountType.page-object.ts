import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddAccountTypePo extends BasePageObject {
  static readonly tid = "add-account-type-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): AddAccountTypePo {
    return new AddAccountTypePo(element.byTestId(AddAccountTypePo.tid));
  }

  chooseLinkedAccount(): Promise<void> {
    return this.root.byTestId("choose-linked-as-account-type").click();
  }
}
