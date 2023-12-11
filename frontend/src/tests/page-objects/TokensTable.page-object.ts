import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";
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

  async getFirstColumnHeader(): Promise<string> {
    return this.getText("column-header-1");
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

  async findRowByName(
    projectName: string
  ): Promise<TokensTableRowPo | undefined> {
    const rows = await this.getRows();
    for (const row of rows) {
      const name = await row.getProjectName();
      if (name === projectName) {
        return row;
      }
    }
    return undefined;
  }

  async getRowData(projectName: string): Promise<TokensTableRowData> {
    const row = await this.findRowByName(projectName);
    if (isNullish(row)) {
      throw new Error(`Row with project name ${projectName} not found`);
    }
    return row.getData();
  }

  async clickSendOnRow(projectName: string): Promise<void> {
    const row = await this.findRowByName(projectName);
    if (isNullish(row)) {
      throw new Error(`Row with project name ${projectName} not found`);
    }
    return row.click("send-button-component");
  }

  getLastRowText(): Promise<string> {
    return this.getText("last-row");
  }
}
