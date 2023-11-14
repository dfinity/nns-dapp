import type { PageObjectElement } from "$tests/types/page-object.types";
import { TokensTableRowPo } from "./TokensTableRow.page-object";
import { BasePageObject } from "./base.page-object";

export class TokensTablePo extends BasePageObject {
  private static readonly TID = "tokens-table-component";

  static under(element: PageObjectElement): TokensTablePo {
    return new TokensTablePo(element.byTestId(TokensTablePo.TID));
  }

  getRows(): Promise<TokensTableRowPo[]> {
    return TokensTableRowPo.allUnder(this.root);
  }
}
