import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ChipPo extends BasePageObject {
  private static TID = "chip-component";

  static under(element: PageObjectElement): ChipPo {
    return new ChipPo(element.byTestId(ChipPo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<ChipPo[]> {
    return Array.from(await element.allByTestId(ChipPo.TID)).map(
      (el) => new ChipPo(el)
    );
  }

  async isSelected(): Promise<boolean> {
    return (await this.root.getAttribute("aria-checked")) === "true";
  }
}
