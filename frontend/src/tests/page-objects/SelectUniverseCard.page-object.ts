import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectUniverseCardPo extends BasePageObject {
  private static readonly TID = "select-universe-card";

  static async allUnder(
    element: PageObjectElement
  ): Promise<SelectUniverseCardPo[]> {
    return Array.from(await element.allByTestId(SelectUniverseCardPo.TID)).map(
      (el) => new SelectUniverseCardPo(el)
    );
  }

  static countUnder({
    element,
    count,
  }: {
    element: PageObjectElement;
    count?: number | undefined;
  }): SelectUniverseCardPo[] {
    return element
      .countByTestId({
        tid: SelectUniverseCardPo.TID,
        count,
      })
      .map((el) => new SelectUniverseCardPo(el));
  }

  getName(): Promise<string> {
    return this.root.querySelector("span.name").getText();
  }
}
