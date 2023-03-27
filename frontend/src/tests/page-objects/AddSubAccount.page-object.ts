import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddSubAccountPo extends BasePageObject {
  static readonly tid = "add-sub-account-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): AddSubAccountPo {
    return new AddSubAccountPo(element.byTestId(AddSubAccountPo.tid));
  }

  enterAccountName(name: string): Promise<void> {
    return this.getInput().type(name);
  }

  clickCreate(): Promise<void> {
    this.getButton("create-account-button").click();
  }
}
