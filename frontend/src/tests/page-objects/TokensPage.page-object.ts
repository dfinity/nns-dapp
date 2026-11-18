import { BackdropPo } from "$tests/page-objects/Backdrop.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { HideZeroBalancesTogglePo } from "$tests/page-objects/HideZeroBalancesToggle.page-object";
import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { TokensTablePo } from "$tests/page-objects/TokensTable.page-object";
import type {
  TokensTableRowData,
  TokensTableRowPo,
} from "$tests/page-objects/TokensTableRow.page-object";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TokensPagePo extends BasePageObject {
  private static readonly TID = "tokens-page-component";
  private static readonly tablesIds = [
    "icp-tokens-table-component",
    "ck-tokens-table-component",
    "sns-tokens-table-component",
    "imported-tokens-table-component",
  ];

  static under(element: PageObjectElement): TokensPagePo {
    return new TokensPagePo(element.byTestId(TokensPagePo.TID));
  }

  getUsdValueBannerPo(): UsdValueBannerPo {
    return UsdValueBannerPo.under(this.root);
  }

  getTokensTable(): TokensTablePo {
    return TokensTablePo.under(this.root);
  }

  getAllTokensTable(): TokensTablePo[] {
    return TokensPagePo.tablesIds.map((id) =>
      TokensTablePo.under(this.root, id)
    );
  }

  getIcpTokensTable(): TokensTablePo {
    return TokensTablePo.under(this.root, TokensPagePo.tablesIds[0]);
  }

  getCkTokensTable(): TokensTablePo {
    return TokensTablePo.under(this.root, TokensPagePo.tablesIds[1]);
  }

  getSnsTokensTable(): TokensTablePo {
    return TokensTablePo.under(this.root, TokensPagePo.tablesIds[2]);
  }

  getImportedTokensTable(): TokensTablePo {
    return TokensTablePo.under(this.root, TokensPagePo.tablesIds[3]);
  }

  getSettingsButtonPo(): ButtonPo {
    return this.getButton("settings-button");
  }

  getHideZeroBalancesTogglePo(): HideZeroBalancesTogglePo {
    return HideZeroBalancesTogglePo.under(this.root);
  }

  getBackdropPo(): BackdropPo {
    return BackdropPo.under(this.root);
  }

  getShowAllButtonPo(): ButtonPo {
    return this.getButton("show-all-button");
  }

  getImportTokenButtonPo(): ButtonPo {
    return this.getButton("import-token-button");
  }

  getImportTokenModalPo(): ImportTokenModalPo {
    return ImportTokenModalPo.under(this.root);
  }

  hasTokensTable(): Promise<boolean> {
    return this.getTokensTable().isPresent();
  }

  async getPresentTokensTables(): Promise<TokensTablePo[]> {
    const tables = this.getAllTokensTable();
    const present = await Promise.all(tables.map((table) => table.isPresent()));
    return tables.filter((_, index) => present[index]);
  }

  async getRows(): Promise<TokensTableRowPo[]> {
    const tables = await this.getPresentTokensTables();
    return (await Promise.all(tables.map((table) => table.getRows()))).flat();
  }

  async getTokenNames(): Promise<string[]> {
    const tables = await this.getPresentTokensTables();
    return (
      await Promise.all(tables.map((table) => table.getTokenNames()))
    ).flat();
  }

  async getRowsData(): Promise<TokensTableRowData[]> {
    const tables = await this.getPresentTokensTables();
    return (
      await Promise.all(tables.map((table) => table.getRowsData()))
    ).flat();
  }

  async getTableWithRow(projectName: string): Promise<TokensTablePo> {
    const tables = await this.getPresentTokensTables();
    for (const table of tables) {
      if ((await table.getTokenNames()).includes(projectName)) {
        return table;
      }
    }
    throw new Error(`Row with project name ${projectName} not found`);
  }

  async getRowByName(projectName: string): Promise<TokensTableRowPo> {
    const table = await this.getTableWithRow(projectName);
    return table.getRowByName(projectName);
  }

  async getRowData(projectName: string): Promise<TokensTableRowData> {
    const table = await this.getTableWithRow(projectName);
    return table.getRowData(projectName);
  }

  async clickSendOnRow(projectName: string): Promise<void> {
    const table = await this.getTableWithRow(projectName);
    return table.clickSendOnRow(projectName);
  }

  async clickReceiveOnRow(projectName: string): Promise<void> {
    const table = await this.getTableWithRow(projectName);
    return table.clickReceiveOnRow(projectName);
  }
}
