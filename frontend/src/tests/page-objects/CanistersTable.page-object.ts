import { CanistersTableRowPo } from "$tests/page-objects/CanistersTableRow.page-object";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CanistersTablePo extends ResponsiveTablePo {
  private static readonly TID = "canisters-table-component";

  static under(element: PageObjectElement): CanistersTablePo {
    return new CanistersTablePo(element.byTestId(CanistersTablePo.TID));
  }

  getRows(): Promise<CanistersTableRowPo[]> {
    return CanistersTableRowPo.allUnder(this.root);
  }

  async getCanisterNames(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getCanisterName()));
  }
}
