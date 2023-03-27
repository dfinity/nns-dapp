import { AddAccountModalPo } from "$tests/page-objects/AddAccountModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAddAccountPo extends BasePageObject {
  static readonly tid = "nns-add-account-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsAddAccountPo {
    return new NnsAddAccountPo(element.byTestId(NnsAddAccountPo.tid));
  }

  getAddAccountModalPo(): AddAccountModalPo {
    return AddAccountModalPo.under(this.root);
  }

  clickAddAccount(): Promise<void> {
    return this.getButton().click();
  }
}
