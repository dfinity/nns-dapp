import { ResponsiveTableRowPo } from "$tests/page-objects/ResponsiveTableRow.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ResponsiveTablePo extends BasePageObject {
  private static readonly TID = "responsive-table-component";

  static under(element: PageObjectElement): ResponsiveTablePo {
    return new ResponsiveTablePo(element.byTestId(ResponsiveTablePo.TID));
  }

  async getColumnHeaders(): Promise<string[]> {
    return Promise.all(
      (await this.root.querySelectorAll("[role='columnheader']")).map((el) =>
        el.getText()
      )
    );
  }

  getRows(): Promise<ResponsiveTableRowPo[]> {
    return ResponsiveTableRowPo.allUnder(this.root);
  }
}
