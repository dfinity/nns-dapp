import { BaseAccountsPo } from "$tests/page-objects/BaseAccounts.page-object";
import { NnsAddAccountPo } from "$tests/page-objects/NnsAddAccount.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAccountsPo extends BaseAccountsPo {
  private static readonly TID = "accounts-body";

  static under(element: PageObjectElement): NnsAccountsPo {
    return new NnsAccountsPo(element.byTestId(NnsAccountsPo.TID));
  }

  getNnsAddAccountPo(): NnsAddAccountPo {
    return NnsAddAccountPo.under(this.root);
  }

  addAccount(name: string): Promise<void> {
    return this.getNnsAddAccountPo().addAccount(name);
  }
}
