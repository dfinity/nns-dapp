import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { DesktopTokensTablePo } from "./DesktopTokensTable.page-object";

export class SignInTokensPagePo extends BasePageObject {
  private static readonly TID = "sign-in-tokens-page-component";

  static under(element: PageObjectElement): SignInTokensPagePo {
    return new SignInTokensPagePo(element.byTestId(SignInTokensPagePo.TID));
  }

  getTokensTablePo() {
    return DesktopTokensTablePo.under(this.root);
  }

  async getTokenNames(): Promise<string[]> {
    const rows = await this.getTokensTablePo().getRows();
    return Promise.all(rows.map((row) => row.getProjectName()));
  }
}
