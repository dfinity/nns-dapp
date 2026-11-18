import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { TokensTablePo } from "$tests/page-objects/TokensTable.page-object";
import type { TokensTableRowPo } from "$tests/page-objects/TokensTableRow.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SignInTokensPagePo extends BasePageObject {
  private static readonly TID = "sign-in-tokens-page-component";

  static under(element: PageObjectElement): SignInTokensPagePo {
    return new SignInTokensPagePo(element.byTestId(SignInTokensPagePo.TID));
  }

  async getTokensTablePos(): Promise<TokensTablePo[]> {
    const elements = await this.root.allByTestId("tokens-table-component");
    return elements.map((element) => new TokensTablePo(element));
  }

  async getTokenNames(): Promise<string[]> {
    const tables = await this.getTokensTablePos();
    return (
      await Promise.all(tables.map((table) => table.getTokenNames()))
    ).flat();
  }

  async getRowByName(projectName: string): Promise<TokensTableRowPo> {
    for (const table of await this.getTokensTablePos()) {
      if ((await table.getTokenNames()).includes(projectName)) {
        return table.getRowByName(projectName);
      }
    }
    throw new Error(`Row with project name ${projectName} not found`);
  }

  getImportTokenModalPo(): ImportTokenModalPo {
    return ImportTokenModalPo.under(this.root);
  }
}
