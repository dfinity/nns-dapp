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

  getRowByName(projectName: string): TokensTableRowPo | undefined {
    return TokensTableRowPo.byTitle({ element: this.root, title: projectName });
  }

  async getRowData(projectName: string): Promise<TokensTableRowData> {
    const row = await this.getRowByName(projectName);
    if (isNullish(row)) {
      throw new Error(`Row with project name ${projectName} not found`);
    }
    return row.getData();
  }

  async clickButtonOnRow({
    testId,
    projectName,
  }: {
    testId: string;
    projectName: string;
  }): Promise<void> {
    const row = await this.getRowByName(projectName);
    if (isNullish(row)) {
      throw new Error(`Row with project name ${projectName} not found`);
    }
    return row.click(testId);
  }

  async clickSendOnRow(projectName: string): Promise<void> {
    return this.clickButtonOnRow({
      testId: "send-button-component",
      projectName,
    });
  }

  async clickReceiveOnRow(projectName: string): Promise<void> {
    return this.clickButtonOnRow({
      testId: "receive-button-component",
      projectName,
    });
  }

  getLastRowText(): Promise<string> {
    return this.getText("last-row");
  }
}
