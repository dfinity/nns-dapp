import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddPrincipalPo extends BasePageObject {
  private static readonly TID = "add-principal-component";

  static under(element: PageObjectElement): AddPrincipalPo {
    return new AddPrincipalPo(element.byTestId(AddPrincipalPo.TID));
  }

  getInputWithErrorPo(): InputWithErrorPo {
    return InputWithErrorPo.under({ element: this.root });
  }

  async addPrincipal(principal: string): Promise<void> {
    await this.getInputWithErrorPo().typeText(principal);
    await this.click("add-principal-button");
  }
}
