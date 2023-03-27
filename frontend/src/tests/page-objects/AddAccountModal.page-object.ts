import { AddAccountTypePo } from "$tests/page-objects/AddAccountType.page-object";
import { AddSubAccountPo } from "$tests/page-objects/AddSubAccount.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddAccountModalPo extends BasePageObject {
  static readonly tid = "add-account-modal-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): AddAccountModalPo {
    return new AddAccountModalPo(element.byTestId(AddAccountModalPo.tid));
  }

  getAddAccountTypePo(): AddAccountTypePo {
    return AddAccountTypePo.under(this.root);
  }

  getAddSubAccountPo(): AddSubAccountPo {
    return AddSubAccountPo.under(this.root);
  }

  waitForClosed(): Promise<void> {
    return this.root.waitForAbsent();
  }
}
