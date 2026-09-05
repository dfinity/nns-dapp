import { ResponsiveTableRowPo } from "$tests/page-objects/ResponsiveTableRow.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CanistersTableRowPo extends ResponsiveTableRowPo {
  static async allUnder(
    element: PageObjectElement
  ): Promise<CanistersTableRowPo[]> {
    return Array.from(await element.allByTestId(ResponsiveTableRowPo.TID)).map(
      (el) => new CanistersTableRowPo(el)
    );
  }

  async getCanisterName(): Promise<string> {
    return (await this.getText("canister-name")).trim();
  }
}
