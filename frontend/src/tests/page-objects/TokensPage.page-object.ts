import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TokensTablePo } from "./TokensTable.page-object";
import type { TokensTableRowData } from "./TokensTableRow.page-object";

export class TokensPagePo extends BasePageObject {
  private static readonly TID = "tokens-page-component";

  static under(element: PageObjectElement): TokensPagePo {
    return new TokensPagePo(element.byTestId(TokensPagePo.TID));
  }

  getTokensTable(): TokensTablePo {
    return TokensTablePo.under(this.root);
  }

  hasTokensTable(): Promise<boolean> {
    return this.getTokensTable().isPresent();
  }

  getTokenNames(): Promise<string[]> {
    return this.getTokensTable().getTokenNames();
  }

  getRowsData(): Promise<TokensTableRowData[]> {
    return this.getTokensTable().getRowsData();
  }

  clickSendOnRow(index: number): Promise<void> {
    return this.getTokensTable().clickSendOnRow(index);
  }
}
