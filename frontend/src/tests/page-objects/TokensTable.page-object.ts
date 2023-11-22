import type { PageObjectElement } from "$tests/types/page-object.types";
import {
  TokensTableRowPo,
  type TokensTableRowData,
} from "./TokensTableRow.page-object";
import { BasePageObject } from "./base.page-object";

export class TokensTablePo extends BasePageObject {
  private static readonly TID = "tokens-table-component";

  static under(element: PageObjectElement): TokensTablePo {
    return new TokensTablePo(element.byTestId(TokensTablePo.TID));
  }

  async getColumnHeaders(): Promise<[string, string]> {
    return [
      await this.getText("column-header-1"),
      await this.getText("column-header-2"),
    ];
  }

  getRows(): Promise<TokensTableRowPo[]> {
    return TokensTableRowPo.allUnder(this.root);
  }

  async getTokenNames(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getProjectName()));
  }

  async getRowsData(): Promise<TokensTableRowData[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getData()));
  }
}
