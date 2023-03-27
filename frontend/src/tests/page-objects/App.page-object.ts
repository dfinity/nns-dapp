import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AppPo extends BasePageObject {
  constructor(root: PageObjectElement) {
    super(root);
  }

  getAccountsPo(): AccountsPo {
    return AccountsPo.under(this.root);
  }
}
