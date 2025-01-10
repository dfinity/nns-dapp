import { TokensTablePo } from "$tests/page-objects/TokensTable.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SignInTokensPagePo extends BasePageObject {
  private static readonly TID = "sign-in-tokens-page-component";

  static under(element: PageObjectElement): SignInTokensPagePo {
    return new SignInTokensPagePo(element.byTestId(SignInTokensPagePo.TID));
  }

  getTokensTablePo() {
    return TokensTablePo.under(this.root);
  }

  getTokenNames(): Promise<string[]> {
    return this.getTokensTablePo().getTokenNames();
  }
}
