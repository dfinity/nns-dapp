import type { PageObjectElement } from "$tests/types/page-object.types";
import { DesktopTokensTableRowPo } from "./DesktopTokensTableRow.page-object";
import { BasePageObject } from "./base.page-object";

export class DesktopTokensTablePo extends BasePageObject {
  private static readonly TID = "desktop-tokens-table-component";

  static under(element: PageObjectElement): DesktopTokensTablePo {
    return new DesktopTokensTablePo(element.byTestId(DesktopTokensTablePo.TID));
  }

  getRows(): Promise<DesktopTokensTableRowPo[]> {
    return DesktopTokensTableRowPo.allUnder(this.root);
  }
}
