import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddSubAccountPo extends BasePageObject {
  private static readonly TID = "add-sub-account-component";

  static under(element: PageObjectElement): AddSubAccountPo {
    return new AddSubAccountPo(element.byTestId(AddSubAccountPo.TID));
  }

  enterAccountName(name: string): Promise<void> {
    return this.getTextInput().typeText(name);
  }

  clickCreate(): Promise<void> {
    return this.getButton("confirm-text-input-screen-button").click();
  }
}
