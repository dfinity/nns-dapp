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

  static async countUnder({
    element,
    expectedCount,
  }: {
    element: PageObjectElement;
    expectedCount?: number | undefined;
  }): Promise<SelectUniverseCardPo[]> {
    return Array.from(
      await element.countByTestId({
        tid: SelectUniverseCardPo.TID,
        expectedCount,
      })
    ).map((el) => new SelectUniverseCardPo(el));
  }

  getName(): Promise<string> {
    return this.root.querySelector("span.name").getText();
  }
}
