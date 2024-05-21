import { NeuronsTableRowPo } from "$tests/page-objects/NeuronsTableRow.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronsTablePo extends BasePageObject {
  private static readonly TID = "neurons-table-component";

  static under(element: PageObjectElement): NeuronsTablePo {
    return new NeuronsTablePo(element.byTestId(NeuronsTablePo.TID));
  }

  getNeuronsTableRowPos(): Promise<NeuronsTableRowPo[]> {
    return NeuronsTableRowPo.allUnder(this.root);
  }
}
