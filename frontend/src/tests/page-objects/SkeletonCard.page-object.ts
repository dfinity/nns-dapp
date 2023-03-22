import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
export class SkeletonCardPo extends BasePageObject {
  static readonly tid = "skeleton-card";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static async allUnder(element: PageObjectElement): Promise<SkeletonCardPo[]> {
    return Array.from(
      await element.querySelectorAll(`[data-tid=${SkeletonCardPo.tid}]`)
    ).map((el) => new SkeletonCardPo(el));
  }
}
