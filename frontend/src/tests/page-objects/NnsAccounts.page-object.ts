import { NnsAddAccountPo } from "$tests/page-objects/NnsAddAccount.page-object";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TokensTablePo } from "$tests/page-objects/TokensTable.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";

export class NnsAccountsPo extends BasePageObject {
  private static readonly TID = "accounts-body";

  static under(element: PageObjectElement): NnsAccountsPo {
    return new NnsAccountsPo(element.byTestId(NnsAccountsPo.TID));
  }

  getUsdValueBannerPo(): UsdValueBannerPo {
    return UsdValueBannerPo.under(this.root);
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
