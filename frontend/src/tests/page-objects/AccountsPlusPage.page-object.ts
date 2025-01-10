import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { SignInAccountsPo } from "$tests/page-objects/SignInAccounts.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AccountsPlusPagePo extends BasePageObject {
  private static readonly TID = "accounts-plus-page-component";

  static under(element: PageObjectElement): AccountsPlusPagePo {
    return new AccountsPlusPagePo(element.byTestId(AccountsPlusPagePo.TID));
  }

  getAccountsPo(): AccountsPo {
    return AccountsPo.under(this.root);
  }

  getSignInAccountsPo(): SignInAccountsPo {
    return SignInAccountsPo.under(this.root);
  }
}
