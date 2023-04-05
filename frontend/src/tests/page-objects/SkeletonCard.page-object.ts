import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SkeletonCardPo extends BasePageObject {
  private static readonly TID = "skeleton-card";

  static async allUnder(element: PageObjectElement): Promise<SkeletonCardPo[]> {
    return Array.from(await element.allByTestId(SkeletonCardPo.TID)).map(
      (el) => new SkeletonCardPo(el)
    );
  }
}
