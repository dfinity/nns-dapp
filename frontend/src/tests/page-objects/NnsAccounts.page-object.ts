import { BaseAccountsPo } from "$tests/page-objects/BaseAccounts.page-object";
import { NnsAddAccountPo } from "$tests/page-objects/NnsAddAccount.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TokensTablePo } from "./TokensTable.page-object";

export class NnsAccountsPo extends BaseAccountsPo {
  private static readonly TID = "accounts-body";

  static under(element: PageObjectElement): NnsAccountsPo {
    return new NnsAccountsPo(element.byTestId(NnsAccountsPo.TID));
  }

  getTokensTablePo() {
    return TokensTablePo.under(this.root);
  }

  hasTokensTable(): Promise<boolean> {
    return this.getTokensTablePo().isPresent();
  }

  getAddAccountRow(): PageObjectElement {
    return this.root.byTestId("add-account-row");
  }

  getAddAccountRowTabindex(): Promise<string> {
    return this.getAddAccountRow().getAttribute("tabindex");
  }

  // Only when MY_TOKENS_ENABLED=true
  clickAddAccount(): Promise<void> {
    return this.getAddAccountRow().click();
  }

  getNnsAddAccountPo(): NnsAddAccountPo {
    return NnsAddAccountPo.under(this.root);
  }

  addAccount(name: string): Promise<void> {
    return this.getNnsAddAccountPo().addAccount(name);
  }
}
